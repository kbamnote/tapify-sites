"use client";

/**
 * SEO panel — how each page appears in Google and when shared.
 *
 * Unlike navigation, these fields are ALREADY consumed by the renderer
 * (generateMetadata in app/[[...slug]]/page.tsx), so every control here has a
 * real effect: title/description/keywords/robots/canonical per page, plus the
 * site name and favicon. Edits target the CURRENT page — switch pages from the
 * left rail to edit another.
 */

import { useEffect, useState } from "react";
import { useBuilder } from "./store";
import { Field } from "./fields";
import type { Seo } from "@/lib/types";

/** Human labels for the four robots combinations — precise, not dumbed down. */
const ROBOTS: { value: NonNullable<Seo["robots"]>; label: string }[] = [
  { value: "index,follow", label: "Show in search results (recommended)" },
  { value: "noindex,follow", label: "Hide from search results" },
  { value: "index,nofollow", label: "Show, but don't follow links" },
  { value: "noindex,nofollow", label: "Hide, and don't follow links" },
];

const TITLE_IDEAL = 60;
const DESC_IDEAL = 160;

function Group({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</span>
        <span className={`text-slate-400 transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <div className="space-y-3 px-3 pb-4">{children}</div>}
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-slate-900";

/** A text field with local draft + commit-on-blur and an optional length hint. */
function TextField({
  label, value, placeholder, onCommit, ideal, textarea,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onCommit: (v: string) => void;
  ideal?: number;
  textarea?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const over = ideal !== undefined && draft.length > ideal;
  const commit = () => { if (draft !== value) onCommit(draft); };

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label className="text-[11px] font-semibold text-slate-700">{label}</label>
        {ideal !== undefined && (
          <span className={`text-[10px] ${over ? "text-amber-600" : "text-slate-400"}`}>
            {draft.length}/{ideal}
          </span>
        )}
      </div>
      {textarea ? (
        <textarea
          rows={3}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          className={inputCls}
        />
      ) : (
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
          className={inputCls}
        />
      )}
    </div>
  );
}

export default function SeoPanel() {
  const doc = useBuilder((s) => s.doc);
  const slug = useBuilder((s) => s.slug);
  const pageId = useBuilder((s) => s.pageId);
  const setPageSeo = useBuilder((s) => s.setPageSeo);
  const setSiteMeta = useBuilder((s) => s.setSiteMeta);

  const page = doc?.pages.find((p) => p.id === pageId) ?? doc?.pages[0];
  if (!doc || !page) return null;

  const seo: Seo = page.seo ?? {};
  const site = doc.site;

  // What Google will actually show, given the fallbacks the renderer applies.
  const effectiveTitle = seo.title?.trim() || `${page.title} | ${site.name}`;
  const previewHost = `${slug ?? "yoursite"}.tapify.co.in`;
  const previewPath = page.slug === "/" ? "" : page.slug;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-3 py-3">
        <p className="text-sm font-bold text-slate-900">SEO</p>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
          Editing <span className="font-semibold text-slate-700">{page.title}</span>. Switch pages from the left to edit another.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Live search-result preview so the fields' effect is obvious. */}
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-3">
          <div className="rounded-md border border-slate-200 bg-white p-2.5">
            <p className="truncate text-[11px] text-emerald-700">{previewHost}{previewPath}</p>
            <p className="truncate text-[13px] font-medium text-blue-800">{effectiveTitle}</p>
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-600">
              {seo.description?.trim() || "Add a description to control the text Google shows here."}
            </p>
          </div>
        </div>

        <Group title="This page" defaultOpen>
          <TextField
            label="Page title"
            value={seo.title ?? ""}
            placeholder={`${page.title} | ${site.name}`}
            ideal={TITLE_IDEAL}
            onCommit={(v) => setPageSeo(page.id, { title: v || undefined })}
          />
          <TextField
            label="Meta description"
            value={seo.description ?? ""}
            placeholder="One or two sentences describing this page."
            ideal={DESC_IDEAL}
            textarea
            onCommit={(v) => setPageSeo(page.id, { description: v || undefined })}
          />
          <TextField
            label="Keywords"
            value={(seo.keywords ?? []).join(", ")}
            placeholder="printing, business cards, surat"
            onCommit={(v) => {
              const list = v.split(",").map((k) => k.trim()).filter(Boolean);
              setPageSeo(page.id, { keywords: list.length ? list : undefined });
            }}
          />

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">Search engines</label>
            <select
              value={seo.robots ?? "index,follow"}
              onChange={(e) => setPageSeo(page.id, { robots: e.target.value as Seo["robots"] })}
              className={inputCls}
            >
              {ROBOTS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {page.visible === false && (
              <p className="mt-1 text-[10px] leading-snug text-amber-600">
                This page is hidden, so it already returns 404 and won&apos;t be indexed regardless.
              </p>
            )}
          </div>
        </Group>

        <Group title="Social sharing">
          <Field
            field={{ key: "ogImage", type: "media", label: "Share image", help: "Shown when the page is shared on WhatsApp, Facebook, etc. Ideal size 1200×630." }}
            value={seo.ogImage}
            onChange={(v) => setPageSeo(page.id, { ogImage: (v as string) || undefined })}
          />
        </Group>

        <Group title="Advanced">
          <TextField
            label="Canonical URL"
            value={seo.canonical ?? ""}
            placeholder="https://…"
            onCommit={(v) => setPageSeo(page.id, { canonical: v.trim() || undefined })}
          />
          <p className="text-[10px] leading-snug text-slate-400">
            Only set this if the same content lives at another URL you want search engines to prefer.
          </p>
        </Group>

        <Group title="Site-wide">
          <TextField
            label="Site name"
            value={site.name}
            placeholder="Your business name"
            onCommit={(v) => setSiteMeta({ name: v })}
          />
          <Field
            field={{ key: "favicon", type: "media", label: "Favicon", help: "The little icon in the browser tab. A square image works best." }}
            value={site.favicon}
            onChange={(v) => setSiteMeta({ favicon: (v as string) || "" })}
          />
        </Group>
      </div>
    </div>
  );
}
