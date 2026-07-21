/**
 * Section registry: manifest `type` -> React component.
 *
 * These are the SAME components the builder canvas renders, which is why the
 * preview can never drift from the published site.
 *
 * Adding a section = add a manifest in builder/schema/sections/<type>.json and
 * one entry here. Nothing else in the renderer or either editor changes.
 */

import type { ComponentType } from "react";
import type { Section, SectionProps, SiteDoc } from "@/lib/types";

import Header from "./Header";
import Hero from "./Hero";
import About from "./About";
import Services from "./Services";
import Gallery from "./Gallery";
import Stats from "./Stats";
import Team from "./Team";
import Testimonials from "./Testimonials";
import Faq from "./Faq";
import Cta from "./Cta";
import Contact from "./Contact";
import Footer from "./Footer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SECTION_REGISTRY: Record<string, ComponentType<SectionProps<any>>> = {
  header: Header,
  hero: Hero,
  about: About,
  services: Services,
  gallery: Gallery,
  stats: Stats,
  team: Team,
  testimonials: Testimonials,
  faq: Faq,
  cta: Cta,
  contact: Contact,
  footer: Footer,
};

export function hasSection(type: string): boolean {
  return type in SECTION_REGISTRY;
}

/**
 * Request-scoped extras. These are NOT part of the document — they describe the
 * current request — so the builder can render the very same components without
 * them and still get a faithful preview.
 */
interface RenderContext {
  siteSlug?: string;
  formStatus?: "sent" | "error";
}

/**
 * Render one section. Unknown or hidden sections render nothing — a document
 * from a newer schema must degrade gracefully rather than crash the page.
 */
export function RenderSection({
  section,
  doc,
  siteSlug,
  formStatus,
}: { section: Section; doc: SiteDoc } & RenderContext) {
  if (section.visible === false || section.style?.hidden) return null;

  const Comp = SECTION_REGISTRY[section.type];
  if (!Comp) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[tapify-sites] No component for section type "${section.type}"`);
    }
    return null;
  }

  return (
    <Comp
      section={section}
      props={section.props ?? {}}
      doc={doc}
      siteSlug={siteSlug}
      formStatus={formStatus}
    />
  );
}

/** Render a page's sections in document order (array order IS visual order). */
export function RenderSections({
  sections,
  doc,
  siteSlug,
  formStatus,
}: { sections: Section[]; doc: SiteDoc } & RenderContext) {
  return (
    <>
      {sections.map((s) => (
        <RenderSection key={s.id} section={s} doc={doc} siteSlug={siteSlug} formStatus={formStatus} />
      ))}
    </>
  );
}
