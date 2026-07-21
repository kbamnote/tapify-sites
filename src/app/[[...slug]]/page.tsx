import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import type { SiteDoc } from "@/lib/types";
import { getPublishedSite, slugFromHost, findPage, mediaUrl } from "@/lib/api";
import { themeToCssVars, googleFontsHref } from "@/lib/theme";
import { RenderSections } from "@/sections";
import demoSite from "@/lib/demo-site.json";

/**
 * The public renderer.
 *
 * One catch-all route serves EVERY customer website:
 *   <slug>.tapify.co.in/        -> page "/"
 *   <slug>.tapify.co.in/about   -> page "/about"
 *
 * The slug comes from the Host header (routing decision B: DNS points the
 * subdomain straight here, so the PHP backend is never involved). The document
 * is fetched from the published API and rendered with ISR, so a live page is
 * served from cache and only revalidates after a publish.
 *
 * Next 16: headers() and params are async and must be awaited.
 */

// Route segment config must be a statically analyzable literal — Next cannot
// read an imported constant here. Keep this in sync with
// PUBLISHED_REVALIDATE_SECONDS in lib/api.ts (used for the fetch itself).
export const revalidate = 60;
export const dynamicParams = true;

type RouteParams = { slug?: string[] };

/** Resolve which document to render for this request. */
type Resolved = { doc: SiteDoc; path: string; isDemo: boolean; siteSlug?: string };

async function resolveSite(params: Promise<RouteParams>): Promise<Resolved | null> {
  const { slug: segments } = await params;
  const path = "/" + (segments ?? []).join("/");
  const normalized = path === "/" ? "/" : path.replace(/\/+$/, "");

  const host = (await headers()).get("host");
  const siteSlug = slugFromHost(host);

  if (siteSlug) {
    const res = await getPublishedSite(siteSlug);
    if (!res) return null;
    return { doc: res.doc, path: normalized, isDemo: false, siteSlug };
  }

  // No site subdomain (localhost / apex / builder host). In development we render
  // the demo fixture so the renderer can be worked on before anything is published.
  if (process.env.NODE_ENV !== "production") {
    return { doc: demoSite as unknown as SiteDoc, path: normalized, isDemo: true };
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const resolved = await resolveSite(params);
  if (!resolved) return { title: "Not found" };

  const { doc, path } = resolved;
  const page = findPage(doc, path);
  if (!page) return { title: doc.site.name };

  const seo = page.seo ?? {};
  const title = seo.title || `${page.title} | ${doc.site.name}`;
  const description = seo.description;
  const ogImage = mediaUrl(seo.ogImage);

  return {
    title,
    description,
    keywords: seo.keywords,
    robots: seo.robots ?? "index,follow",
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    icons: mediaUrl(doc.site.favicon) ? { icon: mediaUrl(doc.site.favicon) } : undefined,
    openGraph: {
      title,
      description,
      siteName: doc.site.name,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function SitePage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await resolveSite(params);

  if (!resolved) {
    // On the builder host there is no customer site to render, so the bare root
    // would 404 and read as a broken deployment. Send it to the builder instead.
    const host = ((await headers()).get("host") ?? "").split(":")[0].toLowerCase();
    if (host.startsWith("builder.")) redirect("/builder");
    notFound();
  }

  const { doc, path, isDemo, siteSlug } = resolved;
  const page = findPage(doc, path);
  if (!page || page.visible === false) notFound();

  // form-submit.php sends the visitor back here with ?sent=1|0. Reading it on the
  // server keeps the confirmation working without JavaScript; it costs no extra
  // caching because headers() already makes this route dynamic, and the site
  // document itself stays cached via the tagged fetch in lib/api.ts.
  const sent = (await searchParams).sent;
  const formStatus = sent === "1" ? "sent" : sent === "0" ? "error" : undefined;

  const fonts = googleFontsHref(doc.theme);

  return (
    <>
      {/* Only the fonts this site's theme actually uses. */}
      {fonts && <link rel="stylesheet" href={fonts} />}

      {/* The theme lives here as CSS variables — every section inherits it, which
          is why changing one token restyles the whole page. */}
      <main style={themeToCssVars(doc.theme)}>
        <RenderSections sections={page.sections} doc={doc} siteSlug={siteSlug} formStatus={formStatus} />
      </main>

      {isDemo && (
        <div
          style={{
            position: "fixed", bottom: 12, right: 12, zIndex: 50,
            background: "#111827", color: "#fff", borderRadius: 999,
            padding: "6px 14px", fontSize: 12, fontFamily: "system-ui",
          }}
        >
          demo fixture — no site published for this host
        </div>
      )}
    </>
  );
}
