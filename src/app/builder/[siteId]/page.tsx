import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";

import type { SiteDoc } from "@/lib/types";
import type { SchemaBundle, SectionManifest } from "@/builder/schema-types";
import { API_BASE } from "@/lib/api";
import Editor from "@/builder/Editor";
import demoSite from "@/lib/demo-site.json";

/**
 * The builder editor — served at builder.tapify.co.in/builder/<siteId>.
 *
 * The section manifests come from the LIVE backend (api/sites/schema.php), so
 * the editor's UI is generated from the same contract the validator enforces.
 * Ship a new section manifest and this editor supports it with no redeploy.
 *
 * The draft is private, so the user's Tapify session cookie is forwarded. That
 * works with no extra auth because the backend's CORS already trusts
 * *.tapify.co.in origins with credentials.
 *
 * /builder/demo renders a local fixture so the editor can be worked on before
 * anything is published.
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

async function getDraft(siteId: string, cookie: string | null) {
  try {
    const res = await fetch(`${API_BASE}/sites/get.php?id=${encodeURIComponent(siteId)}&kind=draft`, {
      cache: "no-store",
      headers: cookie ? { cookie } : undefined,
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success) return null;
    return json.data as { site: { id: number; slug: string; name: string }; rev: number; doc: SiteDoc };
  } catch {
    return null;
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

  // Demo mode: local fixture, no backend site required.
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

  const cookie = (await headers()).get("cookie");
  const data = await getDraft(siteId, cookie);
  if (!data) notFound();

  return (
    <Editor
      siteId={data.site.id}
      slug={data.site.slug}
      rev={data.rev}
      doc={data.doc}
      manifests={manifests}
    />
  );
}
