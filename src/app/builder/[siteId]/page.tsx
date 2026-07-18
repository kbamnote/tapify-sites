import type { Metadata } from "next";

import type { SiteDoc } from "@/lib/types";
import type { SchemaBundle, SectionManifest } from "@/builder/schema-types";
import { API_BASE } from "@/lib/api";
import Editor from "@/builder/Editor";
import BuilderLoader from "@/builder/BuilderLoader";
import demoSite from "@/lib/demo-site.json";

/**
 * The builder editor — builder.tapify.co.in/builder/<siteId>.
 *
 * Split deliberately:
 *  - SERVER fetches the section manifests. They are public and cacheable, and
 *    the editor generates its entire UI from them, so a new section manifest is
 *    supported with no redeploy.
 *  - BROWSER fetches the site draft (see BuilderLoader). The Tapify session
 *    cookie is host-only for app.tapify.co.in, so it never reaches this server;
 *    fetching the draft here would always look signed-out.
 *
 * /builder/demo runs on a local fixture so the editor can be tried without an
 * account and without publishing anything.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Website Builder | Tapify",
  robots: "noindex,nofollow", // never index the editor
};

async function getManifests(): Promise<SectionManifest[]> {
  try {
    const res = await fetch(`${API_BASE}/sites/schema.php`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    const bundle = (json?.data ?? json) as SchemaBundle;
    return bundle?.sections ?? [];
  } catch {
    return [];
  }
}

export default async function BuilderPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const manifests = await getManifests();

  if (!manifests.length) {
    return (
      <div className="flex h-dvh items-center justify-center bg-slate-50 p-6">
        <div className="max-w-sm text-center">
          <h1 className="text-base font-bold text-slate-900">Builder unavailable</h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Could not load the section library from the Tapify API. The editor builds itself from that
            contract, so it cannot start without it.
          </p>
        </div>
      </div>
    );
  }

  // Demo mode: local fixture, no account required.
  if (siteId === "demo") {
    return (
      <Editor
        demo
        siteId={0}
        slug="demo"
        rev={1}
        doc={demoSite as unknown as SiteDoc}
        manifests={manifests}
      />
    );
  }

  return <BuilderLoader siteId={siteId} manifests={manifests} />;
}
