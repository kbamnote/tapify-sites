"use client";

/**
 * Business Info panel — site-wide details consumed by the Contact, Footer and
 * Business-Hours sections: contact channels, social links and the weekly
 * opening-hours editor (per-day toggle + From / To times).
 *
 * Everything writes to doc.business through the store's patchBusiness, so it
 * shares the same undo / autosave path as the rest of the editor.
 */

import { useBuilder } from "./store";
import type { Business, BusinessHours } from "@/lib/types";

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

const input =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-500";
const timeSel =
  "rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:border-slate-500";

const SOCIAL: [keyof NonNullable<Business["social"]>, string][] = [
  ["facebook", "Facebook"], ["instagram", "Instagram"], ["youtube", "YouTube"],
  ["linkedin", "LinkedIn"], ["twitter", "X (Twitter)"], ["telegram", "Telegram"],
];

export default function BusinessPanel() {
  const doc = useBuilder((s) => s.doc);
  const patchBusiness = useBuilder((s) => s.patchBusiness);
  if (!doc) return null;
  const biz = doc.business ?? {};

  const stored = new Map((biz.hours ?? []).map((h) => [h.day, h]));
  const rowFor = (day: BusinessHours["day"]) => {
    const h = stored.get(day);
    return { open: h?.open ?? "10:00 AM", close: h?.close ?? "06:00 PM", closed: h ? !!h.closed : false };
  };
  /** Rebuild the full 7-day array so the stored hours stay complete + ordered. */
  const setDay = (day: BusinessHours["day"], patch: Partial<BusinessHours>) => {
    const hours: BusinessHours[] = DAYS.map(([d]) => {
      const r = rowFor(d);
      const m = d === day ? { ...r, ...patch } : r;
      return { day: d, open: m.open, close: m.close, closed: m.closed };
    });
    patchBusiness({ hours });
  };

  const setField = (key: keyof Business, value: string) => patchBusiness({ [key]: value } as Partial<Business>);
  const setSocial = (key: string, value: string) =>
    patchBusiness({ social: { ...(biz.social ?? {}), [key]: value } });

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-slate-200 px-3 py-3">
        <p className="text-sm font-bold text-slate-900">Business Info</p>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
          Shared across your Contact, Footer and Business-Hours sections.
        </p>
      </div>

      {/* Contact channels */}
      <div className="space-y-2.5 border-b border-slate-200 px-3 py-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Contact</p>
        {([
          ["phone", "Phone", "+91 98765 43210"],
          ["whatsapp", "WhatsApp number", "919876543210"],
          ["email", "Email", "hello@business.com"],
          ["address", "Address", "123 Main Street, City"],
          ["mapUrl", "Google Maps link", "https://maps.google.com/…"],
        ] as [keyof Business, string, string][]).map(([key, label, ph]) => (
          <div key={key}>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">{label}</label>
            <input
              className={input}
              placeholder={ph}
              value={(biz[key] as string) ?? ""}
              onChange={(e) => setField(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Social links */}
      <div className="space-y-2.5 border-b border-slate-200 px-3 py-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Social links</p>
        {SOCIAL.map(([key, label]) => (
          <div key={key}>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">{label}</label>
            <input
              className={input}
              placeholder={`https://…`}
              value={biz.social?.[key] ?? ""}
              onChange={(e) => setSocial(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Opening hours */}
      <div className="px-3 py-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">Opening hours</p>
        <div className="space-y-2">
          {DAYS.map(([day, label]) => {
            const r = rowFor(day);
            const open = !r.closed;
            return (
              <div
                key={day}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2"
              >
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
        <p className="mt-3 text-[10px] leading-snug text-slate-400">
          Add a “Business Hours” section to a page to display these.
        </p>
      </div>
    </div>
  );
}
