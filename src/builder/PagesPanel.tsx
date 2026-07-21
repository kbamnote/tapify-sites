"use client";

/**
 * Pages panel — add, rename, reorder, delete pages and choose the home page.
 *
 * The store keeps the document's invariants (exactly one "/" home, unique
 * slugs, never zero pages) so this UI only has to present them. Editing a page's
 * name or slug here also switches the editor to that page, so the canvas always
 * shows what you're changing.
 *
 * Note: "visible off" genuinely 404s that page on the published site (the
 * renderer checks it). There is no on-site menu yet, so page ORDER is cosmetic
 * for now — it becomes the menu order once a header/nav section exists.
 */

import { useEffect, useState } from "react";
import { useBuilder } from "./store";
import type { Page } from "@/lib/types";

const MAX_PAGES = 50; // mirrors SiteValidator::MAX_PAGES

export default function PagesPanel() {
  const doc = useBuilder((s) => s.doc);
  const pageId = useBuilder((s) => s.pageId);
  const addPage = useBuilder((s) => s.addPage);

  const pages = doc?.pages ?? [];
  const atLimit = pages.length >= MAX_PAGES;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3">
        <div>
          <p className="text-sm font-bold text-slate-900">Pages</p>
          <p className="mt-0.5 text-[10px] text-slate-500">{pages.length} of {MAX_PAGES}</p>
        </div>
        <button
          type="button"
          onClick={addPage}
          disabled={atLimit}
          title={atLimit ? `Maximum ${MAX_PAGES} pages` : "Add a new page"}
          className="rounded bg-slate-900 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-slate-700 disabled:opacity-40"
        >
          + Add page
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {pages.map((p, i) => (
          <PageRow
            key={p.id}
            page={p}
            index={i}
            total={pages.length}
            active={p.id === pageId}
          />
        ))}
      </div>
    </div>
  );
}

function PageRow({ page, index, total, active }: { page: Page; index: number; total: number; active: boolean }) {
  const selectPage = useBuilder((s) => s.selectPage);
  const renamePage = useBuilder((s) => s.renamePage);
  const setPageSlug = useBuilder((s) => s.setPageSlug);
  const setHomePage = useBuilder((s) => s.setHomePage);
  const movePage = useBuilder((s) => s.movePage);
  const removePage = useBuilder((s) => s.removePage);
  const toggleVisible = useBuilder((s) => s.togglePageVisible);

  const isHome = page.slug === "/";
  const hidden = page.visible === false;

  // Local drafts so typing is smooth; commit on blur/Enter. Re-sync when the
  // store changes the value under us (e.g. slug normalised, or "set as home").
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  useEffect(() => setTitle(page.title), [page.title]);
  useEffect(() => setSlug(page.slug), [page.slug]);

  return (
    <div
      className={`rounded-lg border p-2 transition-colors ${
        active ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-center gap-1">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => selectPage(page.id)}
          onBlur={() => renamePage(page.id, title.trim() || "Untitled")}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
          className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1.5 py-1 text-[12px] font-semibold text-slate-900 outline-none hover:border-slate-200 focus:border-slate-900 focus:bg-white"
          placeholder="Page name"
        />
        {isHome && (
          <span className="shrink-0 rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            Home
          </span>
        )}
      </div>

      <div className="mt-1 flex items-center gap-1 px-1.5">
        <span className="shrink-0 text-[11px] text-slate-400">/</span>
        {isHome ? (
          <span className="flex-1 text-[11px] text-slate-400">the site&apos;s home page</span>
        ) : (
          <input
            value={slug.replace(/^\//, "")}
            onChange={(e) => setSlug("/" + e.target.value)}
            onFocus={() => selectPage(page.id)}
            onBlur={() => setPageSlug(page.id, slug)}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            spellCheck={false}
            className="min-w-0 flex-1 rounded border border-transparent bg-transparent py-0.5 text-[11px] text-slate-600 outline-none hover:border-slate-200 focus:border-slate-900 focus:bg-white"
            placeholder="about"
          />
        )}
      </div>

      <div className="mt-1.5 flex items-center gap-1 border-t border-slate-100 pt-1.5">
        <RowBtn label="Move up" disabled={index === 0} onClick={() => movePage(page.id, -1)}>↑</RowBtn>
        <RowBtn label="Move down" disabled={index === total - 1} onClick={() => movePage(page.id, 1)}>↓</RowBtn>

        {!isHome && (
          <RowBtn label="Set as home page" onClick={() => setHomePage(page.id)}>⌂ Home</RowBtn>
        )}

        <RowBtn
          label={isHome ? "The home page is always visible" : hidden ? "Show page" : "Hide page"}
          disabled={isHome}
          onClick={() => toggleVisible(page.id)}
        >
          {hidden ? "Hidden" : "Visible"}
        </RowBtn>

        <span className="flex-1" />

        <RowBtn
          label={isHome ? "Set another page as home first" : total <= 1 ? "A site needs at least one page" : "Delete page"}
          danger
          disabled={isHome || total <= 1}
          onClick={() => {
            if (confirm(`Delete “${page.title}” and all its sections? This cannot be undone from here.`)) {
              removePage(page.id);
            }
          }}
        >
          Delete
        </RowBtn>
      </div>
    </div>
  );
}

function RowBtn({
  children, onClick, label, disabled, danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium transition-colors disabled:opacity-30 ${
        danger ? "text-slate-500 hover:border-rose-300 hover:text-rose-600" : "text-slate-600 hover:border-slate-900 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}
