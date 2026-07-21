"use client";

/**
 * Left rail: the page's sections in order, plus the Add-Section library.
 *
 * The list IS the page order (stacked-section model — array order is visual
 * order), so reordering here is literally reordering the document.
 */

import { useMemo, useState } from "react";
import { useBuilder } from "./store";

export default function SectionTree() {
  const doc = useBuilder((s) => s.doc);
  const pageId = useBuilder((s) => s.pageId);
  const selectedId = useBuilder((s) => s.selectedId);
  const manifests = useBuilder((s) => s.manifests);
  const select = useBuilder((s) => s.select);
  const selectPage = useBuilder((s) => s.selectPage);
  const setRightTab = useBuilder((s) => s.setRightTab);
  const move = useBuilder((s) => s.moveSection);
  const remove = useBuilder((s) => s.removeSection);
  const duplicate = useBuilder((s) => s.duplicateSection);
  const toggle = useBuilder((s) => s.toggleVisible);
  const addSection = useBuilder((s) => s.addSection);

  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");

  const page = doc?.pages.find((p) => p.id === pageId) ?? doc?.pages[0];
  const sections = page?.sections ?? [];

  // Sections already on the page, used to enforce singleton/maxPerPage.
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of sections) c[s.type] = (c[s.type] ?? 0) + 1;
    return c;
  }, [sections]);

  const library = useMemo(() => {
    const all = Object.values(manifests);
    const term = q.trim().toLowerCase();
    return all
      .filter((m) => !term || m.label.toLowerCase().includes(term) || m.type.includes(term))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [manifests, q]);

  const pages = doc?.pages ?? [];

  return (
    <div className="flex h-full flex-col">
      {/* Page switcher — one click to move between pages; “Manage” opens the
          full Pages panel on the right. Hidden when there's only one page. */}
      {pages.length > 0 && (
        <div className="flex items-center gap-1.5 border-b border-slate-200 px-2 py-2">
          <select
            value={page?.id ?? ""}
            onChange={(e) => selectPage(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-800 outline-none focus:border-slate-900"
            title="Switch page"
          >
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}{p.slug === "/" ? " (home)" : ""}{p.visible === false ? " • hidden" : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setRightTab("pages")}
            title="Manage pages"
            className="shrink-0 rounded border border-slate-300 px-2 py-1.5 text-[10px] font-semibold text-slate-600 hover:border-slate-900 hover:text-slate-900"
          >
            Pages
          </button>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Sections</span>
        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          className="rounded bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white hover:bg-slate-700"
        >
          {adding ? "Close" : "+ Add"}
        </button>
      </div>

      {adding && (
        <div className="border-b border-slate-200 bg-slate-50 p-2">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sections…"
            className="mb-2 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-slate-900"
          />
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {library.map((m) => {
              const used = counts[m.type] ?? 0;
              const limit = m.singleton ? 1 : m.maxPerPage;
              const blocked = limit !== undefined && used >= limit;
              return (
                <button
                  key={m.type}
                  type="button"
                  disabled={blocked}
                  title={blocked ? (m.singleton ? "Only one allowed per site" : `Maximum ${limit} per page`) : m.description}
                  onClick={() => {
                    addSection(m.type);
                    setAdding(false);
                    setQ("");
                  }}
                  className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-left transition-colors hover:border-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="block text-[11px] font-semibold text-slate-800">{m.label}</span>
                  {m.description && <span className="mt-0.5 block truncate text-[10px] text-slate-500">{m.description}</span>}
                </button>
              );
            })}
            {!library.length && <p className="p-2 text-[11px] text-slate-400">No sections match.</p>}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {!sections.length && (
          <p className="p-4 text-center text-[11px] leading-relaxed text-slate-400">
            No sections yet.
            <br />
            Click <strong>+ Add</strong> to start.
          </p>
        )}

        <ul className="space-y-1">
          {sections.map((s, i) => {
            const m = manifests[s.type];
            const active = s.id === selectedId;
            const hidden = s.visible === false;
            return (
              <li key={s.id}>
                <div
                  className={`group flex items-center gap-1 rounded-md border px-2 py-1.5 transition-colors ${
                    active ? "border-slate-900 bg-slate-900" : "border-transparent bg-white hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => select(s.id)}
                    className={`flex-1 truncate text-left text-[11px] font-semibold ${
                      active ? "text-white" : hidden ? "text-slate-400 line-through" : "text-slate-700"
                    }`}
                  >
                    {m?.label ?? s.type}
                  </button>

                  <div className={`flex shrink-0 items-center gap-0.5 ${active ? "" : "opacity-0 group-hover:opacity-100"}`}>
                    <IconBtn active={active} label="Move up" disabled={i === 0} onClick={() => move(s.id, -1)}>↑</IconBtn>
                    <IconBtn active={active} label="Move down" disabled={i === sections.length - 1} onClick={() => move(s.id, 1)}>↓</IconBtn>
                    <IconBtn active={active} label={hidden ? "Show" : "Hide"} onClick={() => toggle(s.id)}>{hidden ? "○" : "◉"}</IconBtn>
                    <IconBtn active={active} label="Duplicate" onClick={() => duplicate(s.id)}>⧉</IconBtn>
                    <IconBtn
                      active={active}
                      label="Delete"
                      danger
                      onClick={() => {
                        if (confirm(`Delete this ${m?.label ?? s.type} section?`)) remove(s.id);
                      }}
                    >
                      ✕
                    </IconBtn>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  disabled,
  active,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded px-1 text-[10px] leading-5 disabled:opacity-25 ${
        active ? "text-white/70 hover:text-white" : danger ? "text-slate-400 hover:text-rose-600" : "text-slate-400 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}
