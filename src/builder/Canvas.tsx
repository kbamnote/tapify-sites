"use client";

/**
 * The editing canvas.
 *
 * It renders the document with the SAME components the public site uses
 * (@/sections). Nothing here re-implements a section, so what the customer sees
 * while editing is exactly what gets published — the preview cannot drift.
 *
 * Selection works by delegation: every section renders data-section-id, so one
 * click handler on the wrapper is enough (no per-section wiring).
 */

import { useCallback, useEffect, useRef } from "react";
import { useBuilder } from "./store";
import { themeToCssVars, googleFontsHref } from "@/lib/theme";
import { RenderSections } from "@/sections";

const DEVICE_WIDTH: Record<string, string> = {
  desktop: "100%",
  tablet: "820px",
  mobile: "390px",
};

export default function Canvas() {
  const doc = useBuilder((s) => s.doc);
  const pageId = useBuilder((s) => s.pageId);
  const selectedId = useBuilder((s) => s.selectedId);
  const device = useBuilder((s) => s.device);
  const select = useBuilder((s) => s.select);

  const scrollRef = useRef<HTMLDivElement>(null);
  // Clicking a section on the canvas shouldn't scroll it — it's already in view.
  const skipScroll = useRef(false);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      const el = (e.target as HTMLElement).closest("[data-section-id]");
      const id = el?.getAttribute("data-section-id");
      if (id) {
        e.preventDefault(); // don't follow links while editing
        skipScroll.current = true;
        select(id);
      }
    },
    [select]
  );

  // Selecting a section anywhere else (the tree, Add Section) brings it to the
  // front of the canvas so you're always editing what you can see.
  useEffect(() => {
    if (!selectedId) return;
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }
    const root = scrollRef.current;
    if (!root) return;
    const sel = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(selectedId) : selectedId;
    const el = root.querySelector(`[data-section-id="${sel}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedId]);

  if (!doc) return null;
  const page = doc.pages.find((p) => p.id === pageId) ?? doc.pages[0];
  if (!page) return null;

  const fonts = googleFontsHref(doc.theme);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto bg-slate-100 p-4">
      {fonts && <link rel="stylesheet" href={fonts} />}

      <div
        className="mx-auto overflow-hidden bg-white shadow-xl transition-[width] duration-200"
        style={{
          width: DEVICE_WIDTH[device],
          maxWidth: "100%",
          borderRadius: device === "desktop" ? 8 : 18,
        }}
      >
        {/* Clicking anywhere in a section selects it. */}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <div
          onClick={onClick}
          style={{ ...themeToCssVars(doc.theme), cursor: "default" }}
          className="[&_[data-section-id]]:relative [&_[data-section-id]:hover]:outline [&_[data-section-id]:hover]:outline-2 [&_[data-section-id]:hover]:-outline-offset-2 [&_[data-section-id]:hover]:outline-slate-900/25"
        >
          <RenderSections sections={page.sections} doc={doc} />
        </div>

        {!page.sections.length && (
          <div className="p-16 text-center">
            <p className="text-sm font-semibold text-slate-700">This page is empty</p>
            <p className="mt-1 text-xs text-slate-500">Add a section from the left panel to begin.</p>
          </div>
        )}
      </div>

      {/* Highlight the selected section. Injected as CSS so it costs no re-render. */}
      {selectedId && (
        <style>{`
          [data-section-id="${selectedId}"] {
            outline: 2px solid #0f172a !important;
            outline-offset: -2px;
          }
        `}</style>
      )}
    </div>
  );
}
