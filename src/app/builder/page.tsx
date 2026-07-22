import type { Metadata } from "next";

import type { SchemaBundle, IndustryRecipe } from "@/builder/schema-types";
import { API_BASE } from "@/lib/api";
import SiteList from "@/builder/SiteList";

/**
 * Builder home — the customer's websites.
 *
 * The industry list comes from the server (public, cacheable); the customer's
 * own sites are loaded in the browser, because that is the only place the
 * Tapify session cookie exists (see builder/client-api.ts).
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Websites | Tapify Builder",
  robots: "noindex,nofollow",
};

async function getIndustries(): Promise<IndustryRecipe[]> {
  try {
    const res = await fetch(`${API_BASE}/sites/schema.php`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    const bundle = (json?.data ?? json) as SchemaBundle;
    return bundle?.industries ?? [];
  } catch {
    return [];
  }
}

export default async function BuilderHome() {
  const industries = await getIndustries();
  return <SiteList industries={industries} />;
}
