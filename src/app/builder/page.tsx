import { headers } from "next/headers";
import type { Metadata } from "next";

import type { SchemaBundle } from "@/builder/schema-types";
import { API_BASE } from "@/lib/api";

/**
 * Builder home — the landing page on builder.tapify.co.in.
 *
 * Without this, the root 404s (the site renderer deliberately ignores the
 * "builder" host), which reads as "the deployment is broken" even though it
 * isn't. This gives a real entry point and confirms the backend connection.
 *
 * Phase 3 replaces the placeholder list with the customer's real sites from
 * api/sites/list.php once there is a way to create one.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Website Builder | Tapify",
  robots: "noindex,nofollow",
};

async function getBundle(): Promise<{ sections: number; industries: number; ok: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/sites/schema.php`, { cache: "no-store" });
    if (!res.ok) return { sections: 0, industries: 0, ok: false };
    const json = await res.json();
    const b = (json?.data ?? json) as SchemaBundle;
    return { sections: b?.sections?.length ?? 0, industries: b?.industries?.length ?? 0, ok: true };
  } catch {
    return { sections: 0, industries: 0, ok: false };
  }
}

export default async function BuilderHome() {
  const bundle = await getBundle();
  const host = (await headers()).get("host") ?? "";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-bold text-slate-900">Tapify Website Builder</h1>
        <p className="mt-1 text-xs text-slate-500">{host}</p>

        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Backend</p>
          {bundle.ok ? (
            <p className="mt-1.5 text-xs text-slate-700">
              Connected — <strong>{bundle.sections}</strong> sections,{" "}
              <strong>{bundle.industries}</strong> industry recipe{bundle.industries === 1 ? "" : "s"} loaded.
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-rose-600">
              Could not reach the Tapify API. The editor builds itself from that contract, so it cannot start.
            </p>
          )}
        </div>

        <a
          href="/builder/demo"
          className="mt-3 block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white hover:bg-slate-700"
        >
          Open the demo editor →
        </a>

        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
          The demo runs on a sample site so the editor can be tried without publishing anything. To edit a
          real website, open <code className="rounded bg-slate-100 px-1">/builder/&lt;siteId&gt;</code> — that
          requires being signed in to Tapify.
        </p>
      </div>
    </div>
  );
}
