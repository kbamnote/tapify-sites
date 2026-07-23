/**
 * TypeScript mirror of builder/schema/site.schema.json (the Site Document).
 *
 * The PHP schema is the source of truth and validates every save; these types
 * exist so the renderer and builder get autocomplete + compile-time safety.
 * If you change the schema, change these together.
 *
 * Layout model is STACKED SECTIONS: a page is an ordered array of full-width
 * blocks. There are deliberately no x/y coordinates.
 */

export type MediaRef = string; // "media:12" | "https://…" | "/path.jpg"

export interface Link {
  text?: string;
  href?: string;
  newTab?: boolean;
  style?: "primary" | "secondary" | "ghost" | "link";
}

export interface ThemeTokens {
  preset?: string;
  mode?: "light" | "dark";
  color?: Partial<Record<
    "primary" | "secondary" | "accent" | "bg" | "surface" | "text" | "muted" | "border",
    string
  >>;
  font?: { heading?: string; body?: string };
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "pill";
  spacing?: "compact" | "comfortable" | "spacious";
  container?: "narrow" | "normal" | "wide" | "full";
}

export interface SectionStyle {
  paddingY?: "none" | "sm" | "md" | "lg" | "xl";
  align?: "left" | "center" | "right";
  bg?: "default" | "surface" | "primary" | "dark" | "image" | "none";
  bgMedia?: MediaRef;
  overlay?: number;
  radius?: "none" | "sm" | "md" | "lg" | "xl";
  /** Per-section font colours, for when the theme's text colour reads wrong here. */
  headingColor?: string;
  textColor?: string;
  hidden?: boolean;
  animation?: "none" | "fade" | "slide-up" | "zoom";
}

export interface Section {
  id: string;
  type: string;
  variant?: string;
  visible?: boolean;
  /** Validated server-side against the section's manifest, so it stays open here. */
  props?: Record<string, unknown>;
  style?: SectionStyle;
  responsive?: { mobile?: SectionStyle; tablet?: SectionStyle };
}

export interface Seo {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: MediaRef;
  canonical?: string;
  robots?: "index,follow" | "noindex,follow" | "index,nofollow" | "noindex,nofollow";
}

export interface Page {
  id: string;
  slug: string; // "/" | "/about"
  title: string;
  visible?: boolean;
  seo?: Seo;
  sections: Section[];
}

export interface NavItem {
  label: string;
  pageId?: string;
  href?: string;
  newTab?: boolean;
}

export interface BusinessHours {
  day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  open?: string;
  close?: string;
  closed?: boolean;
}

export interface Business {
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  mapUrl?: string;
  social?: Partial<Record<
    "facebook" | "instagram" | "youtube" | "linkedin" | "twitter" | "telegram",
    string
  >>;
  hours?: BusinessHours[];
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "textarea" | "select" | "checkbox" | "radio" | "date" | "file";
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface SiteForm {
  id: string;
  title?: string;
  submitText?: string;
  successMessage?: string;
  notifyEmail?: string;
  fields: FormField[];
}

export interface SiteDoc {
  schemaVersion: 1;
  site: { name: string; industry?: string; locale?: string; favicon?: MediaRef };
  theme?: ThemeTokens;
  nav?: { header?: NavItem[]; footer?: NavItem[] };
  pages: Page[];
  business?: Business;
  forms?: SiteForm[];
}

/** Shape returned by api/sites/get.php */
export interface SiteResponse {
  site: {
    id: number;
    slug: string;
    name: string;
    industry: string | null;
    status: string;
    published: boolean;
    published_at: string | null;
  };
  kind: "draft" | "published";
  rev: number;
  doc: SiteDoc;
}

/** Every section component receives exactly this. */
export interface SectionProps<P = Record<string, unknown>> {
  section: Section;
  props: P;
  doc: SiteDoc;
  /**
   * The site's slug. Not part of the document (it lives on the site row), but
   * sections that post back to the API — like Contact — need it to identify
   * which site a submission belongs to. Absent in the builder/demo.
   */
  siteSlug?: string;
  /**
   * Outcome of a form post that redirected back to this page ("?sent=1|0").
   * Set by the public renderer only, so the confirmation survives the full-page
   * round trip and works with JavaScript disabled. Absent in the builder/demo.
   */
  formStatus?: "sent" | "error";
}
