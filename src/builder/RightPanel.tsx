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
import BusinessPanel from "./BusinessPanel";
import CatalogPanel from "./CatalogPanel";

const TABS: { id: "section" | "theme" | "pages" | "seo" | "business" | "catalog"; label: string }[] = [
  { id: "section", label: "Section" },
  { id: "pages", label: "Pages" },
  { id: "catalog", label: "Catalogue" },
  { id: "business", label: "Business" },
  { id: "theme", label: "Theme" },
  { id: "seo", label: "SEO" },
];

export default function RightPanel() {
  const rightTab = useBuilder((s) => s.rightTab);
  const setRightTab = useBuilder((s) => s.setRightTab);

  return (
    <div className="flex h-full flex-col">
      {/* WRAPS on purpose. The panel is a fixed 288px and its <aside> is
          overflow-hidden, so six tabs on one row put Theme and SEO past the edge
          with no way to scroll to them — they were simply unreachable. Wrapping
          keeps every tab clickable at any panel width, which matters because the
          builder is embedded in the dashboard iframe and does not always get the
          width it asks for.

          The active state is a filled pill rather than the old underline: an
          underline on a tab in the FIRST row points at nothing, since the panel
          border is under the last row. */}
      <div className="flex shrink-0 flex-wrap gap-1 border-b border-slate-200 px-2 pb-1.5 pt-2">
        {TABS.map((t) => {
          const active = rightTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => setRightTab(t.id)}
              className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
        ) : rightTab === "business" ? (
          <BusinessPanel />
        ) : rightTab === "catalog" ? (
          <CatalogPanel />
        ) : (
          <Inspector />
        )}
      </div>
    </div>
  );
}
