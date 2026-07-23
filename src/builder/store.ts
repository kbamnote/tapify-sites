"use client";

/**
 * Builder store.
 *
 * Selector-based on purpose: the document changes on every keystroke, and a
 * plain React context would re-render the whole editor (canvas included) each
 * time. Components subscribe only to the slice they need.
 *
 * Save model (matches api/sites/save-draft.php):
 *  - Autosave is debounced and sends the `rev` we loaded.
 *  - The server bumps rev; we adopt the new one.
 *  - If someone saved in between (web vs app) we get 409 + their document and
 *    surface a conflict instead of silently overwriting their work.
 */

import { create } from "zustand";
import type { Section, SiteDoc, SectionStyle, ThemeTokens, Seo, Business } from "@/lib/types";
import type { SectionManifest } from "./schema-types";

const HISTORY_LIMIT = 60;
const AUTOSAVE_MS = 900;

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error" | "conflict";
export type Device = "desktop" | "tablet" | "mobile";

interface Conflict {
  rev: number;
  doc: SiteDoc;
  updated_at?: string;
}

interface BuilderState {
  siteId: number | null;
  slug: string | null;
  rev: number;
  doc: SiteDoc | null;
  manifests: Record<string, SectionManifest>;

  pageId: string | null;
  selectedId: string | null;
  device: Device;
  rightTab: "section" | "theme" | "pages" | "seo" | "business";

  saveState: SaveState;
  saveError: string | null;
  conflict: Conflict | null;

  past: SiteDoc[];
  future: SiteDoc[];

  // lifecycle
  init(args: { siteId: number; slug: string; rev: number; doc: SiteDoc; manifests: SectionManifest[] }): void;

  // selection / chrome
  selectPage(pageId: string): void;
  select(sectionId: string | null): void;
  setDevice(d: Device): void;
  setRightTab(tab: "section" | "theme" | "pages" | "seo" | "business"): void;

  // pages
  addPage(): void;
  renamePage(pageId: string, title: string): void;
  setPageSlug(pageId: string, slug: string): void;
  setHomePage(pageId: string): void;
  movePage(pageId: string, dir: -1 | 1): void;
  removePage(pageId: string): void;
  togglePageVisible(pageId: string): void;

  // SEO / site meta
  setPageSeo(pageId: string, patch: Partial<Seo>): void;
  setSiteMeta(patch: { name?: string; favicon?: string }): void;
  patchBusiness(patch: Partial<Business>): void;

  // mutations
  setProp(sectionId: string, key: string, value: unknown): void;
  setStyle(sectionId: string, key: keyof SectionStyle, value: unknown): void;
  setVariant(sectionId: string, variant: string): void;
  toggleVisible(sectionId: string): void;
  duplicateSection(sectionId: string): void;
  removeSection(sectionId: string): void;
  moveSection(sectionId: string, dir: -1 | 1): void;
  addSection(type: string, atIndex?: number): void;
  setThemeColor(key: string, value: string): void;
  setThemeFont(which: "heading" | "body", value: string): void;
  setThemeToken(key: "radius" | "spacing" | "container" | "mode", value: string): void;
  /** Merge a partial theme (e.g. a preset) in ONE history/save step. */
  applyTheme(patch: Partial<ThemeTokens>): void;

  // history + save
  undo(): void;
  redo(): void;
  save(): Promise<void>;
  resolveConflictKeepMine(): void;
  resolveConflictTakeTheirs(): void;
}

const API = process.env.NEXT_PUBLIC_TAPIFY_API ?? "https://app.tapify.co.in/api";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/** Stable, never-reused section id (matches SchemaRegistry::newSectionId). */
function newId(): string {
  const b = new Uint8Array(5);
  crypto.getRandomValues(b);
  return "s_" + Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

/** A page id, distinct prefix from sections for readability. */
function newPageId(): string {
  const b = new Uint8Array(4);
  crypto.getRandomValues(b);
  return "p_" + Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

/** Normalise a title into the slug BODY (no leading slash). "About Us" -> "about-us". */
function slugBody(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9/]+/g, "-").replace(/-+/g, "-").replace(/^[-/]+|[-/]+$/g, "");
}

/** A route slug ("/about") that no other page already uses. */
function uniqueSlug(pages: { id: string; slug: string }[], base: string, exceptId: string): string {
  const taken = new Set(pages.filter((p) => p.id !== exceptId).map((p) => p.slug));
  const body = slugBody(base) || "page";
  let slug = "/" + body;
  let n = 2;
  while (taken.has(slug)) slug = `/${body}-${n++}`;
  return slug;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useBuilder = create<BuilderState>((set, get) => {
  /** Apply a change to the current page's sections, recording history + autosave. */
  function mutate(fn: (doc: SiteDoc) => void) {
    const s = get();
    if (!s.doc) return;
    const before = s.doc;
    const next = clone(before);
    fn(next);
    set({
      doc: next,
      past: [...s.past, before].slice(-HISTORY_LIMIT),
      future: [],
      saveState: "dirty",
    });
    scheduleSave();
  }

  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => void get().save(), AUTOSAVE_MS);
  }

  function currentSections(doc: SiteDoc, pageId: string | null): Section[] {
    const page = doc.pages.find((p) => p.id === pageId) ?? doc.pages[0];
    return page?.sections ?? [];
  }

  function withSection(doc: SiteDoc, pageId: string | null, id: string, fn: (s: Section, arr: Section[], i: number) => void) {
    const page = doc.pages.find((p) => p.id === pageId) ?? doc.pages[0];
    if (!page) return;
    const i = page.sections.findIndex((s) => s.id === id);
    if (i === -1) return;
    fn(page.sections[i], page.sections, i);
  }

  return {
    siteId: null,
    slug: null,
    rev: 0,
    doc: null,
    manifests: {},
    pageId: null,
    selectedId: null,
    device: "desktop",
    rightTab: "section",
    saveState: "idle",
    saveError: null,
    conflict: null,
    past: [],
    future: [],

    init({ siteId, slug, rev, doc, manifests }) {
      set({
        siteId,
        slug,
        rev,
        doc,
        manifests: Object.fromEntries(manifests.map((m) => [m.type, m])),
        pageId: doc.pages[0]?.id ?? null,
        selectedId: null,
        past: [],
        future: [],
        saveState: "idle",
        saveError: null,
        conflict: null,
      });
    },

    selectPage: (pageId) => set({ pageId, selectedId: null }),
    // Selecting a section pulls the right panel back to its Inspector, so a click
    // on the canvas always reveals what you just selected.
    select: (selectedId) => set(selectedId ? { selectedId, rightTab: "section" } : { selectedId }),
    setDevice: (device) => set({ device }),
    setRightTab: (rightTab) => set({ rightTab }),

    setProp(sectionId, key, value) {
      mutate((doc) =>
        withSection(doc, get().pageId, sectionId, (s) => {
          s.props = { ...(s.props ?? {}), [key]: value };
        })
      );
    },

    setStyle(sectionId, key, value) {
      mutate((doc) =>
        withSection(doc, get().pageId, sectionId, (s) => {
          const next = { ...(s.style ?? {}), [key]: value } as SectionStyle;
          // undefined means "follow the theme" — drop the key rather than
          // persisting a null the schema would reject.
          if (value === undefined) delete next[key];
          s.style = next;
        })
      );
    },

    setVariant(sectionId, variant) {
      mutate((doc) => withSection(doc, get().pageId, sectionId, (s) => { s.variant = variant; }));
    },

    toggleVisible(sectionId) {
      mutate((doc) =>
        withSection(doc, get().pageId, sectionId, (s) => {
          s.visible = s.visible === false;
        })
      );
    },

    duplicateSection(sectionId) {
      let created: string | null = null;
      mutate((doc) =>
        withSection(doc, get().pageId, sectionId, (s, arr, i) => {
          const copy = clone(s);
          copy.id = newId(); // ids must stay unique across the document
          created = copy.id;
          arr.splice(i + 1, 0, copy);
        })
      );
      if (created) set({ selectedId: created });
    },

    removeSection(sectionId) {
      mutate((doc) => withSection(doc, get().pageId, sectionId, (_s, arr, i) => { arr.splice(i, 1); }));
      if (get().selectedId === sectionId) set({ selectedId: null });
    },

    moveSection(sectionId, dir) {
      mutate((doc) =>
        withSection(doc, get().pageId, sectionId, (_s, arr, i) => {
          const j = i + dir;
          if (j < 0 || j >= arr.length) return;
          [arr[i], arr[j]] = [arr[j], arr[i]];
        })
      );
    },

    addSection(type, atIndex) {
      const m = get().manifests[type];
      if (!m) return;
      const section: Section = {
        id: newId(),
        type,
        variant: m.defaults?.variant ?? m.variants[0]?.id,
        visible: true,
        props: clone(m.defaults?.props ?? {}),
      };
      if (m.style?.defaults) section.style = clone(m.style.defaults) as SectionStyle;

      mutate((doc) => {
        const page = doc.pages.find((p) => p.id === get().pageId) ?? doc.pages[0];
        if (!page) return;
        const i = atIndex ?? page.sections.length;
        page.sections.splice(i, 0, section);
      });
      set({ selectedId: section.id });
    },

    /* ------------------------------------------------------------- pages */

    addPage() {
      const id = newPageId();
      // Seed with a hero so the page isn't a blank screen; fall back to empty
      // if that manifest isn't loaded. Section ids must be unique site-wide.
      const hero = get().manifests["hero"];
      const sections: Section[] = [];
      if (hero) {
        const s: Section = {
          id: newId(),
          type: "hero",
          variant: hero.defaults?.variant ?? hero.variants[0]?.id,
          visible: true,
          props: clone(hero.defaults?.props ?? {}),
        };
        if (hero.style?.defaults) s.style = clone(hero.style.defaults) as SectionStyle;
        sections.push(s);
      }

      mutate((doc) => {
        const slug = uniqueSlug(doc.pages, "New Page", id);
        doc.pages.push({ id, slug, title: "New Page", visible: true, sections });
      });
      set({ pageId: id, selectedId: null });
    },

    renamePage(pageId, title) {
      mutate((doc) => {
        const p = doc.pages.find((x) => x.id === pageId);
        if (p) p.title = title;
        // Keep any header/footer menu label in step with the page name.
        for (const item of [...(doc.nav?.header ?? []), ...(doc.nav?.footer ?? [])]) {
          if (item.pageId === pageId) item.label = title;
        }
      });
    },

    setPageSlug(pageId, slug) {
      mutate((doc) => {
        const p = doc.pages.find((x) => x.id === pageId);
        if (!p || p.slug === "/") return; // the home slug is owned by setHomePage
        p.slug = uniqueSlug(doc.pages, slug, pageId);
      });
    },

    // Make a page the home page ("/"). The old home keeps a route derived from
    // its title, so the "exactly one /" invariant always holds.
    setHomePage(pageId) {
      mutate((doc) => {
        const target = doc.pages.find((x) => x.id === pageId);
        if (!target || target.slug === "/") return;
        const oldHome = doc.pages.find((x) => x.slug === "/");
        if (oldHome) oldHome.slug = uniqueSlug(doc.pages, oldHome.title || "home", oldHome.id);
        target.slug = "/";
        target.visible = true; // the site root can never be hidden
      });
    },

    movePage(pageId, dir) {
      mutate((doc) => {
        const i = doc.pages.findIndex((x) => x.id === pageId);
        const j = i + dir;
        if (i === -1 || j < 0 || j >= doc.pages.length) return;
        [doc.pages[i], doc.pages[j]] = [doc.pages[j], doc.pages[i]];
      });
    },

    removePage(pageId) {
      const { doc } = get();
      if (!doc) return;
      const page = doc.pages.find((x) => x.id === pageId);
      // Never delete the last page or the home page — both would leave an
      // unrenderable site. The UI blocks these too; this is the backstop.
      if (!page || doc.pages.length <= 1 || page.slug === "/") return;

      mutate((d) => {
        d.pages = d.pages.filter((x) => x.id !== pageId);
        // Drop any menu entries that pointed at the deleted page.
        if (d.nav?.header) d.nav.header = d.nav.header.filter((it) => it.pageId !== pageId);
        if (d.nav?.footer) d.nav.footer = d.nav.footer.filter((it) => it.pageId !== pageId);
      });

      if (get().pageId === pageId) {
        const first = get().doc?.pages[0]?.id ?? null;
        set({ pageId: first, selectedId: null });
      }
    },

    togglePageVisible(pageId) {
      mutate((doc) => {
        const p = doc.pages.find((x) => x.id === pageId);
        if (!p || p.slug === "/") return; // the home page must stay visible
        p.visible = p.visible === false;
      });
    },

    /* --------------------------------------------------------- SEO / meta */

    setPageSeo(pageId, patch) {
      mutate((doc) => {
        const p = doc.pages.find((x) => x.id === pageId);
        if (!p) return;
        p.seo = { ...(p.seo ?? {}), ...patch };
      });
    },

    setSiteMeta(patch) {
      mutate((doc) => {
        // site.name is required by the validator, so never let it become empty.
        if (patch.name !== undefined) doc.site.name = patch.name.trim() || doc.site.name;
        if (patch.favicon !== undefined) doc.site.favicon = patch.favicon || undefined;
      });
    },

    patchBusiness(patch) {
      // Site-wide business info (phone / email / social / opening hours) used by
      // the Contact, Footer and Business-Hours sections. Callers pass complete
      // nested objects (e.g. the full `social` map or `hours` array); this does a
      // shallow merge onto doc.business.
      mutate((doc) => {
        doc.business = { ...(doc.business ?? {}), ...patch };
      });
    },

    setThemeColor(key, value) {
      mutate((doc) => {
        doc.theme = doc.theme ?? {};
        doc.theme.color = { ...(doc.theme.color ?? {}), [key]: value };
      });
    },

    setThemeFont(which, value) {
      mutate((doc) => {
        doc.theme = doc.theme ?? {};
        doc.theme.font = { ...(doc.theme.font ?? {}), [which]: value };
      });
    },

    setThemeToken(key, value) {
      mutate((doc) => {
        doc.theme = doc.theme ?? {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (doc.theme as any)[key] = value;
      });
    },

    applyTheme(patch) {
      mutate((doc) => {
        const t: ThemeTokens = (doc.theme = doc.theme ?? {});
        if (patch.color) t.color = { ...(t.color ?? {}), ...patch.color };
        if (patch.font) t.font = { ...(t.font ?? {}), ...patch.font };
        if (patch.preset !== undefined) t.preset = patch.preset;
        if (patch.mode) t.mode = patch.mode;
        if (patch.radius) t.radius = patch.radius;
        if (patch.spacing) t.spacing = patch.spacing;
        if (patch.container) t.container = patch.container;
      });
    },

    undo() {
      const { past, doc, future } = get();
      if (!past.length || !doc) return;
      set({
        doc: past[past.length - 1],
        past: past.slice(0, -1),
        future: [doc, ...future].slice(0, HISTORY_LIMIT),
        saveState: "dirty",
      });
      scheduleSave();
    },

    redo() {
      const { future, doc, past } = get();
      if (!future.length || !doc) return;
      set({
        doc: future[0],
        future: future.slice(1),
        past: [...past, doc].slice(-HISTORY_LIMIT),
        saveState: "dirty",
      });
      scheduleSave();
    },

    async save() {
      const { siteId, rev, doc, saveState } = get();
      if (!siteId || !doc || saveState === "saving" || saveState === "conflict") return;

      set({ saveState: "saving", saveError: null });
      try {
        const res = await fetch(`${API}/sites/save-draft.php`, {
          method: "POST",
          credentials: "include", // CORS already trusts *.tapify.co.in with credentials
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ site_id: siteId, rev, doc, source: "web" }),
        });
        const json = await res.json().catch(() => null);

        if (res.status === 409 && json?.current) {
          // Someone else saved while we were editing — never overwrite silently.
          set({ saveState: "conflict", conflict: json.current as Conflict });
          return;
        }
        if (res.status === 422) {
          set({ saveState: "error", saveError: (json?.errors ?? []).slice(0, 3).join(" · ") || "Document is invalid" });
          return;
        }
        if (!res.ok || !json?.success) {
          set({ saveState: "error", saveError: json?.message ?? `Save failed (${res.status})` });
          return;
        }

        set({ rev: json.data.rev, saveState: "saved" });
      } catch (e) {
        set({ saveState: "error", saveError: e instanceof Error ? e.message : "Network error" });
      }
    },

    resolveConflictKeepMine() {
      const c = get().conflict;
      if (!c) return;
      // Adopt their rev so our next save is accepted, keep our document.
      set({ rev: c.rev, conflict: null, saveState: "dirty" });
      scheduleSave();
    },

    resolveConflictTakeTheirs() {
      const c = get().conflict;
      if (!c) return;
      set({ doc: c.doc, rev: c.rev, conflict: null, saveState: "saved", past: [], future: [] });
    },
  };
});
