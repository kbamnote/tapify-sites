/**
 * Types for the builder contract served by api/sites/schema.php.
 *
 * These describe the SECTION MANIFESTS — not a website. The editor reads these
 * and builds its own UI, which is why adding a section requires no editor code.
 *
 * Mirrors builder/schema/README.md. If the field registry changes there, change
 * it here (and in the app) together.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "toggle"
  | "select"
  | "color"
  | "media"
  | "icon"
  | "link"
  | "repeater"
  | "list"
  | "hours";

export interface FieldDef {
  key: string;
  type: FieldType;
  label?: string;
  group?: string;
  required?: boolean;
  help?: string;
  placeholder?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  default?: unknown;
  options?: string[];
  accept?: string[];
  /** Conditional visibility, e.g. { variant: ["split"] } */
  showIf?: { variant?: string[] };
  /** repeater only */
  fields?: FieldDef[];
  itemLabel?: string;
  addLabel?: string;
  emptyHint?: string;
}

export interface VariantDef {
  id: string;
  label: string;
  preview?: string;
}

export interface SectionManifest {
  type: string;
  label: string;
  category: string;
  icon?: string;
  description?: string;
  industries?: string[];
  singleton?: boolean;
  maxPerPage?: number;
  variants: VariantDef[];
  props: FieldDef[];
  style?: { supports?: string[]; defaults?: Record<string, unknown> };
  defaults?: { variant?: string; props?: Record<string, unknown> };
}

export interface ThemePreset {
  preset: string;
  label: string;
  description?: string;
  industries?: string[];
  tokens: Record<string, unknown>;
}

export interface IndustryRecipe {
  id: string;
  label: string;
  icon?: string;
  theme?: string;
  sections: string[];
  recommended?: { type: string; reason?: string }[];
  copy?: Record<string, string>;
}

export interface SchemaBundle {
  schemaVersion: number;
  siteSchema: unknown;
  sections: SectionManifest[];
  themes: ThemePreset[];
  industries: IndustryRecipe[];
  suggestedSections?: string[];
}

/** Group a manifest's fields into Inspector accordions, preserving order. */
export function groupFields(fields: FieldDef[]): { group: string; fields: FieldDef[] }[] {
  const order: string[] = [];
  const map = new Map<string, FieldDef[]>();
  for (const f of fields) {
    const g = f.group ?? "Content";
    if (!map.has(g)) {
      map.set(g, []);
      order.push(g);
    }
    map.get(g)!.push(f);
  }
  return order.map((g) => ({ group: g, fields: map.get(g)! }));
}

/** Is this field shown for the section's current variant? */
export function fieldApplies(field: FieldDef, variant: string | undefined): boolean {
  const want = field.showIf?.variant;
  if (!want || !want.length) return true;
  if (!variant) return true;
  return want.includes(variant);
}

/** Render a repeater row's collapsed label from a template like "{{title}}". */
export function itemLabel(template: string | undefined, item: Record<string, unknown>, fallback: string): string {
  if (!template) return fallback;
  const out = template.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = item[k];
    return typeof v === "string" || typeof v === "number" ? String(v) : "";
  });
  return out.trim() || fallback;
}
