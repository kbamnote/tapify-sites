"use client";

/**
 * Business Info panel — site-wide details consumed by the Contact, Footer and
 * Business-Hours sections: contact channels, social links and the weekly
 * opening-hours editor (shared HoursEditor).
 *
 * Everything writes to doc.business through the store's patchBusiness, so it
 * shares the same undo / autosave path as the rest of the editor.
 */

import { useBuilder } from "./store";
import type { Business } from "@/lib/types";
import HoursEditor from "./HoursEditor";

const input =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-500";

const SOCIAL: [keyof NonNullable<Business["social"]>, string][] = [
  ["facebook", "Facebook"], ["instagram", "Instagram"], ["youtube", "YouTube"],
  ["linkedin", "LinkedIn"], ["twitter", "X (Twitter)"], ["telegram", "Telegram"],
];

export default function BusinessPanel() {
  const doc = useBuilder((s) => s.doc);
  const patchBusiness = useBuilder((s) => s.patchBusiness);
  if (!doc) return null;
  const biz = doc.business ?? {};

  const setField = (key: keyof Business, value: string) => patchBusiness({ [key]: value } as Partial<Business>);
  const setSocial = (key: string, value: string) => patchBusiness({ social: { ...(biz.social ?? {}), [key]: value } });

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
            <input className={input} placeholder={ph} value={(biz[key] as string) ?? ""} onChange={(e) => setField(key, e.target.value)} />
          </div>
        ))}
      </div>

      {/* Social links */}
      <div className="space-y-2.5 border-b border-slate-200 px-3 py-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Social links</p>
        {SOCIAL.map(([key, label]) => (
          <div key={key}>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">{label}</label>
            <input className={input} placeholder="https://…" value={biz.social?.[key] ?? ""} onChange={(e) => setSocial(key, e.target.value)} />
          </div>
        ))}
      </div>

      {/* Opening hours */}
      <div className="px-3 py-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">Opening hours</p>
        <HoursEditor />
        <p className="mt-3 text-[10px] leading-snug text-slate-400">
          Add a “Business Hours” section to a page to display these.
        </p>
      </div>
    </div>
  );
}
