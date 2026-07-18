"use client";

/**
 * Authenticated calls to the Tapify API, made FROM THE BROWSER.
 *
 * Why client-side and not from the Next.js server:
 * the PHP session cookie is set without a `domain` attribute, so it is
 * host-only for app.tapify.co.in. The browser therefore never sends it to
 * builder.tapify.co.in, and a server-side fetch would see no cookie at all.
 *
 * From the browser it works because:
 *   - the backend sets SameSite=None; Secure, so the cookie is sent cross-origin
 *   - CORS already trusts any *.tapify.co.in origin with credentials
 * So the customer stays signed in with their existing Tapify account — no new
 * login, no token plumbing.
 */

import type { SiteDoc } from "@/lib/types";

export const API = process.env.NEXT_PUBLIC_TAPIFY_API ?? "https://app.tapify.co.in/api";
export const LOGIN_URL = process.env.NEXT_PUBLIC_TAPIFY_LOGIN ?? "https://tapify.co.in/login.html";

/** Thrown when the API says we are not signed in, so the UI can offer a login link. */
export class NotSignedInError extends Error {
  constructor() {
    super("Not signed in");
    this.name = "NotSignedInError";
  }
}

export class ApiError extends Error {
  details: string[];
  constructor(message: string, details: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      credentials: "include",
      cache: "no-store",
      ...init,
      headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError("Could not reach the Tapify API. Check your connection.");
  }

  if (res.status === 401) throw new NotSignedInError();

  const json = await res.json().catch(() => null);

  // Some endpoints answer 200 with success:false instead of 401, and the backend
  // uses several wordings ("Not logged in", "Authentication required. Please
  // login."), so match on the message too rather than relying on status alone.
  if (json && json.success === false && /not logged in|authentication required|please login/i.test(json.message ?? "")) {
    throw new NotSignedInError();
  }

  if (!res.ok || !json?.success) {
    throw new ApiError(json?.message ?? `Request failed (${res.status})`, json?.errors ?? []);
  }
  return json.data as T;
}

/* --------------------------------------------------------------- endpoints */

export interface SiteSummary {
  id: number;
  slug: string;
  name: string;
  industry: string | null;
  status: string;
  published_at: string | null;
  updated_at: string;
}

export function listSites() {
  return request<{ sites: SiteSummary[] }>("/sites/list.php").then((d) => d.sites);
}

export function createSite(input: { name: string; slug?: string; industry?: string }) {
  return request<{ site: SiteSummary; rev: number; doc: SiteDoc }>("/sites/create.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function getDraft(siteId: number | string) {
  return request<{
    site: { id: number; slug: string; name: string; status: string; published: boolean };
    rev: number;
    doc: SiteDoc;
  }>(`/sites/get.php?id=${encodeURIComponent(String(siteId))}&kind=draft`);
}

/** Turn a business name into a valid DNS-label slug (mirrors create.php). */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 63);
}

/** Same rule create.php enforces, so we can validate before the round trip. */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/.test(slug);
}
