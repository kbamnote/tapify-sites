/**
 * Client for the Tapify builder API (PHP backend, already live).
 *
 * This is the ONLY integration point between this Next.js app and Tapify —
 * there is no shared code with tapify-backend / tapify-frontend / tapify-app,
 * just HTTP. Nothing in the old codebase is imported or modified.
 */

import type { SiteDoc, SiteResponse } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_TAPIFY_API ?? "https://app.tapify.co.in/api";

/** Hostnames that are never a customer site slug. Mirrors tapify_reserved_subdomains(). */
const RESERVED = new Set([
  "app", "www", "api", "admin", "dashboard", "login", "mail", "m", "cdn",
  "static", "assets", "ftp", "smtp", "ns1", "ns2", "webmail", "cpanel",
  "builder", "sites", "localhost",
]);

/**
 * Work out which site to render from the incoming Host header.
 *   impulssecareer.tapify.co.in -> "impulssecareer"
 *   builder.tapify.co.in        -> null (that's the editor, not a site)
 */
export function slugFromHost(host: string | null | undefined): string | null {
  if (!host) return null;
  const clean = host.split(":")[0].toLowerCase();

  // Local dev: ?site=<slug> is handled by the caller; treat localhost as no slug.
  if (clean === "localhost" || clean.endsWith(".localhost") || /^\d+\.\d+\.\d+\.\d+$/.test(clean)) {
    return null;
  }
  const parts = clean.split(".");
  if (parts.length < 3) return null;            // apex domain, not a subdomain
  const first = parts[0];
  if (RESERVED.has(first)) return null;
  return first;
}

/** How long a published page stays cached at the edge before revalidating. */
export const PUBLISHED_REVALIDATE_SECONDS = 60;

/**
 * Fetch a site's PUBLISHED document. Returns null when the slug does not exist
 * or has never been published — callers should 404 rather than fall back to a
 * draft (a draft must never leak to the public).
 */
export async function getPublishedSite(slug: string): Promise<SiteResponse | null> {
  try {
    const res = await fetch(
      `${API_BASE}/sites/get.php?slug=${encodeURIComponent(slug)}&kind=published`,
      { next: { revalidate: PUBLISHED_REVALIDATE_SECONDS, tags: [`site:${slug}`] } }
    );
    if (!res.ok) return null;

    const json = await res.json();
    if (!json?.success || !json?.data?.doc) return null;
    return json.data as SiteResponse;
  } catch {
    return null;
  }
}

/**
 * Fetch a site's DRAFT (builder preview only). Requires the caller to forward
 * the user's session cookie — the draft is private working state.
 */
export async function getDraftSite(slug: string, cookie?: string): Promise<SiteResponse | null> {
  try {
    const res = await fetch(
      `${API_BASE}/sites/get.php?slug=${encodeURIComponent(slug)}&kind=draft`,
      {
        cache: "no-store",
        headers: cookie ? { cookie } : undefined,
        credentials: "include",
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !json?.data?.doc) return null;
    return json.data as SiteResponse;
  } catch {
    return null;
  }
}

/** Find a page in the document by its URL path ("/" | "/about"). */
export function findPage(doc: SiteDoc, path: string) {
  const norm = !path || path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return doc.pages.find((p) => p.slug === norm) ?? null;
}

/**
 * Resolve a media reference to a URL.
 * Documents store "media:<id>" so files can be replaced/moved without ever
 * rewriting the document. Absolute URLs and /paths pass through untouched.
 */
export function mediaUrl(ref: string | undefined | null): string | undefined {
  if (!ref) return undefined;
  if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("/")) return ref;
  const m = /^media:(\d+)$/.exec(ref);
  if (m) return `${API_BASE}/sites/media.php?id=${m[1]}`;
  return undefined;
}
