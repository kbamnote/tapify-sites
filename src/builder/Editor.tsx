"use client";

/**
 * Editor shell: wires the four panels together and owns the conflict dialog.
 *
 * Conflicts are a real product problem here, not a theoretical one: the same
 * site can be edited from the web builder and the mobile app at the same time.
 * The API returns 409 + the other party's document, and we make the customer
 * choose. We never silently pick a winner.
 */

import { useEffect } from "react";
import { useBuilder } from "./store";
import type { SiteDoc } from "@/lib/types";
import type { SectionManifest } from "./schema-types";
import TopBar from "./TopBar";
import SectionTree from "./SectionTree";
import Canvas from "./Canvas";
import RightPanel from "./RightPanel";

function ConflictDialog() {
  const conflict = useBuilder((s) => s.conflict);
  const keepMine = useBuilder((s) => s.resolveConflictKeepMine);
  const takeTheirs = useBuilder((s) => s.resolveConflictTakeTheirs);
  if (!conflict) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
        <h2 className="text-base font-bold text-slate-900">This site changed somewhere else</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          It was edited elsewhere (most likely the Tapify app) while you were working
          {conflict.updated_at ? ` — last saved ${new Date(conflict.updated_at).toLocaleString()}` : ""}.
          To avoid losing anyone&apos;s work, choose which version to keep.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={keepMine}
            className="rounded-md bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700"
          >
            Keep my version (overwrite theirs)
          </button>
          <button
            type="button"
            onClick={takeTheirs}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900"
          >
            Load their version (discard my changes)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Editor({
  siteId,
  slug,
  rev,
  doc,
  manifests,
  demo = false,
}: {
  siteId: number;
  slug: string;
  rev: number;
  doc: SiteDoc;
  manifests: SectionManifest[];
  demo?: boolean;
}) {
  const init = useBuilder((s) => s.init);

  useEffect(() => {
    init({ siteId, slug, rev, doc, manifests });
  }, [init, siteId, slug, rev, doc, manifests]);

  const ready = useBuilder((s) => s.doc !== null);
  if (!ready) return null;

  return (
    <div className="flex h-dvh flex-col bg-slate-50">
      <TopBar />

      <div className="flex min-h-0 flex-1">
        <aside className="w-60 shrink-0 border-r border-slate-200 bg-white">
          <SectionTree />
        </aside>

        <main className="min-w-0 flex-1">
          <Canvas />
        </main>

        <aside className="w-72 shrink-0 overflow-hidden border-l border-slate-200 bg-white">
          <RightPanel />
        </aside>
      </div>

      <ConflictDialog />

      {demo && (
        <div className="pointer-events-none fixed bottom-3 left-1/2 z-40 -translate-x-1/2 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] text-white">
          demo mode — editing a local fixture, saving is disabled
        </div>
      )}
    </div>
  );
}
