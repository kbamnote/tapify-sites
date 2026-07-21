"use client";

/**
 * Right sidebar host: switches between the per-section Inspector and the
 * site-wide Theme panel. This is the seam the Pages / SEO panels will slot into
 * later — add a tab, add a panel, nothing else moves.
 *
 * The active tab lives in the store so selecting a section on the canvas can pull
 * this back to the Inspector automatically (see `select` in store.ts).
 */

import { useBuilder } from "./store";
import Inspector from "./Inspector";
import ThemePanel from "./ThemePanel";
import PagesPanel from "./PagesPanel";
import SeoPanel from "./SeoPanel";

const TABS: { id: "section" | "theme" | "pages" | "seo"; label: string }[] = [
  { id: "section", label: "Section" },
  { id: "pages", label: "Pages" },
  { id: "theme", label: "Theme" },
  { id: "seo", label: "SEO" },
];

export default function RightPanel() {
  const rightTab = useBuilder((s) => s.rightTab);
  const setRightTab = useBuilder((s) => s.setRightTab);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 gap-1 border-b border-slate-200 px-2 pt-2">
        {TABS.map((t) => {
          const active = rightTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setRightTab(t.id)}
              className={`rounded-t-md px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                active ? "bg-white text-slate-900 shadow-[inset_0_-2px_0_0_#0f172a]" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1">
        {rightTab === "theme" ? (
          <ThemePanel />
        ) : rightTab === "pages" ? (
          <PagesPanel />
        ) : rightTab === "seo" ? (
          <SeoPanel />
        ) : (
          <Inspector />
        )}
      </div>
    </div>
  );
}
