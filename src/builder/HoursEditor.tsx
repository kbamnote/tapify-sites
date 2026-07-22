"use client";

/**
 * Per-day opening-hours editor: an open/closed toggle plus From / To time
 * dropdowns for each weekday. Reads and writes the site-wide doc.business.hours
 * through the store, so it can be dropped into the Business panel OR a section
 * inspector (the Business Hours section) and stays in sync everywhere.
 */

import { useBuilder } from "./store";
import type { BusinessHours } from "@/lib/types";

const DAYS: [BusinessHours["day"], string][] = [
  ["mon", "Monday"], ["tue", "Tuesday"], ["wed", "Wednesday"], ["thu", "Thursday"],
  ["fri", "Friday"], ["sat", "Saturday"], ["sun", "Sunday"],
];

/** 48 half-hour slots in 12-hour format: "12:00 AM" … "11:30 PM". */
const TIME_OPTIONS: string[] = (() => {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const ampm = h < 12 ? "AM" : "PM";
      const hh = (h % 12) || 12;
      out.push(`${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`);
    }
  }
  return out;
})();

const timeSel =
  "rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:border-slate-500";

export default function HoursEditor() {
  const doc = useBuilder((s) => s.doc);
  const patchBusiness = useBuilder((s) => s.patchBusiness);
  if (!doc) return null;

  const stored = new Map((doc.business?.hours ?? []).map((h) => [h.day, h]));
  const rowFor = (day: BusinessHours["day"]) => {
    const h = stored.get(day);
    return { open: h?.open ?? "10:00 AM", close: h?.close ?? "06:00 PM", closed: h ? !!h.closed : false };
  };
  /** Rewrite the full ordered 7-day array so stored hours stay complete. */
  const setDay = (day: BusinessHours["day"], patch: Partial<BusinessHours>) => {
    const hours: BusinessHours[] = DAYS.map(([d]) => {
      const r = rowFor(d);
      const m = d === day ? { ...r, ...patch } : r;
      return { day: d, open: m.open, close: m.close, closed: m.closed };
    });
    patchBusiness({ hours });
  };

  return (
    <div className="space-y-2">
      {DAYS.map(([day, label]) => {
        const r = rowFor(day);
        const open = !r.closed;
        return (
          <div key={day} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
            <button
              type="button"
              role="switch"
              aria-checked={open}
              aria-label={`${label} ${open ? "open" : "closed"}`}
              onClick={() => setDay(day, { closed: open })}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${open ? "bg-emerald-600" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${open ? "left-[18px]" : "left-0.5"}`} />
            </button>
            <span className="w-16 shrink-0 text-[11px] font-bold uppercase tracking-wide text-slate-700">{label.slice(0, 3)}</span>
            {open ? (
              <div className="flex flex-1 items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500">From</span>
                <select className={timeSel} value={r.open} onChange={(e) => setDay(day, { open: e.target.value })}>
                  {TIME_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
                <span className="text-[10px] font-semibold text-slate-500">To</span>
                <select className={timeSel} value={r.close} onChange={(e) => setDay(day, { close: e.target.value })}>
                  {TIME_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            ) : (
              <span className="text-[11px] italic text-slate-400">✕ Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
