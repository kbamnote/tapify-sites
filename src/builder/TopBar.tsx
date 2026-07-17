"use client";

/**
 * Editor top bar: device preview, undo/redo, save status and Publish.
 *
 * Save status is deliberately explicit. Autosave only ever touches the DRAFT —
 * the live site changes only when Publish is pressed — and a conflict is shown
 * as a real choice rather than silently resolving it.
 */

import { useEffect, useState } from "react";
import { useBuilder, type Device } from "./store";

const API = process.env.NEXT_PUBLIC_TAPIFY_API ?? "https://app.tapify.co.in/api";

const DEVICES: { id: Device; label: string; icon: string }[] = [
  { id: "desktop", label: "Desktop", icon: "🖥" },
  { id: "tablet", label: "Tablet", icon: "▭" },
  { id: "mobile", label: "Mobile", icon: "▯" },
];

function SaveBadge() {
  const state = useBuilder((s) => s.saveState);
  const error = useBuilder((s) => s.saveError);

  const map: Record<string, { text: string; cls: string }> = {
    idle: { text: "Up to date", cls: "text-slate-400" },
    dirty: { text: "Unsaved changes…", cls: "text-amber-600" },
    saving: { text: "Saving…", cls: "text-slate-500" },
    saved: { text: "All changes saved", cls: "text-emerald-600" },
    error: { text: error ?? "Save failed", cls: "text-rose-600" },
    conflict: { text: "Edited elsewhere", cls: "text-rose-600" },
  };
  const v = map[state] ?? map.idle;
  return <span className={`text-[11px] font-medium ${v.cls}`} title={error ?? undefined}>{v.text}</span>;
}

export default function TopBar() {
  const doc = useBuilder((s) => s.doc);
  const slug = useBuilder((s) => s.slug);
  const siteId = useBuilder((s) => s.siteId);
  const device = useBuilder((s) => s.device);
  const setDevice = useBuilder((s) => s.setDevice);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const canUndo = useBuilder((s) => s.past.length > 0);
  const canRedo = useBuilder((s) => s.future.length > 0);
  const save = useBuilder((s) => s.save);
  const saveState = useBuilder((s) => s.saveState);

  const [publishing, setPublishing] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [publishMsg, setPublishMsg] = useState<string | null>(null);

  // Ctrl/Cmd+Z / Shift+Z, Ctrl/Cmd+S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, save]);

  // Don't let the customer close the tab with unsaved work.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (saveState === "dirty" || saveState === "saving") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);

  async function publish() {
    if (!siteId) return;
    setPublishing("busy");
    setPublishMsg(null);
    try {
      await save(); // publish the newest draft, not a stale one
      const res = await fetch(`${API}/sites/publish.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_id: siteId, source: "web" }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setPublishing("error");
        setPublishMsg((json?.errors ?? [])[0] ?? json?.message ?? "Publish failed");
        return;
      }
      setPublishing("done");
      setPublishMsg(null);
      setTimeout(() => setPublishing("idle"), 2500);
    } catch (e) {
      setPublishing("error");
      setPublishMsg(e instanceof Error ? e.message : "Network error");
    }
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="truncate text-sm font-bold text-slate-900">{doc?.site.name ?? "Untitled site"}</span>
        <SaveBadge />
      </div>

      <div className="flex items-center gap-1 rounded-md bg-slate-100 p-0.5">
        {DEVICES.map((d) => (
          <button
            key={d.id}
            type="button"
            title={d.label}
            onClick={() => setDevice(d.id)}
            className={`rounded px-2.5 py-1 text-xs transition-colors ${
              device === d.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {d.icon}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30"
        >
          ↷
        </button>

        {slug && (
          <a
            href={`https://${slug}.tapify.co.in`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-slate-300 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-slate-900"
          >
            View live
          </a>
        )}

        <button
          type="button"
          onClick={publish}
          disabled={publishing === "busy"}
          title={publishMsg ?? "Make the current draft live"}
          className={`rounded px-3 py-1.5 text-[11px] font-bold text-white transition-colors disabled:opacity-60 ${
            publishing === "error" ? "bg-rose-600" : publishing === "done" ? "bg-emerald-600" : "bg-slate-900 hover:bg-slate-700"
          }`}
        >
          {publishing === "busy" ? "Publishing…" : publishing === "done" ? "Published ✓" : publishing === "error" ? "Failed" : "Publish"}
        </button>
      </div>
    </header>
  );
}
