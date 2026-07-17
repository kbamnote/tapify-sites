/**
 * Theme engine: design tokens -> CSS custom properties.
 *
 * Sections NEVER hardcode a colour, font or radius — they read these variables.
 * That is the whole reason changing one token restyles the entire website
 * instantly, and why a customer can never end up with a half-restyled page.
 */

import type { ThemeTokens } from "./types";

const DEFAULTS: Required<Pick<ThemeTokens, "radius" | "spacing" | "container" | "mode">> = {
  radius: "md",
  spacing: "comfortable",
  container: "normal",
  mode: "light",
};

const COLOR_FALLBACK: Record<string, string> = {
  primary: "#2563EB",
  secondary: "#1D4ED8",
  accent: "#F7941D",
  bg: "#FFFFFF",
  surface: "#F5F7FB",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
};

const RADIUS_PX: Record<NonNullable<ThemeTokens["radius"]>, string> = {
  none: "0px",
  sm: "6px",
  md: "12px",
  lg: "18px",
  xl: "26px",
  pill: "999px",
};

/** Vertical rhythm multiplier — drives every section's padding scale. */
const SPACING_SCALE: Record<NonNullable<ThemeTokens["spacing"]>, string> = {
  compact: "0.75",
  comfortable: "1",
  spacious: "1.35",
};

const CONTAINER_PX: Record<NonNullable<ThemeTokens["container"]>, string> = {
  narrow: "900px",
  normal: "1200px",
  wide: "1440px",
  full: "100%",
};

/** Slightly darken a hex colour — used for gradients/hover without a second token. */
function shade(hex: string, amount = -0.15): string {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const num = parseInt(h, 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((num >> 16) & 255) * (1 + amount));
  const g = clamp(((num >> 8) & 255) * (1 + amount));
  const b = clamp((num & 255) * (1 + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/** Readable text colour for a given background — keeps buttons legible on any brand colour. */
function readableOn(hex: string): string {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#FFFFFF";
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const num = parseInt(h, 16);
  const [r, g, b] = [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  // Perceived luminance (ITU-R BT.601)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#111827" : "#FFFFFF";
}

/**
 * Build the CSS variables for a theme. Applied once on the page wrapper, so
 * every section inherits them.
 */
/**
 * Merge theme colours over the fallbacks.
 *
 * A plain spread would let an explicitly-undefined/empty colour in a document
 * wipe out the fallback and emit `--color-primary: undefined`, breaking the
 * whole theme. Only real values are allowed to override.
 */
function mergeColors(overrides: ThemeTokens["color"]): Record<string, string> {
  const out: Record<string, string> = { ...COLOR_FALLBACK };
  for (const [key, value] of Object.entries(overrides ?? {})) {
    if (typeof value === "string" && value.trim() !== "") out[key] = value;
  }
  return out;
}

export function themeToCssVars(theme: ThemeTokens | undefined): React.CSSProperties {
  const t = theme ?? {};
  const color = mergeColors(t.color);

  const radius = RADIUS_PX[t.radius ?? DEFAULTS.radius];
  const spacing = SPACING_SCALE[t.spacing ?? DEFAULTS.spacing];
  const container = CONTAINER_PX[t.container ?? DEFAULTS.container];

  const vars: Record<string, string> = {
    "--color-primary": color.primary,
    "--color-primary-dark": shade(color.primary, -0.18),
    "--color-primary-fg": readableOn(color.primary),
    "--color-secondary": color.secondary,
    "--color-accent": color.accent,
    "--color-accent-fg": readableOn(color.accent),
    "--color-bg": color.bg,
    "--color-surface": color.surface,
    "--color-text": color.text,
    "--color-muted": color.muted,
    "--color-border": color.border,

    "--font-heading": t.font?.heading ? `"${t.font.heading}", system-ui, sans-serif` : "system-ui, sans-serif",
    "--font-body": t.font?.body ? `"${t.font.body}", system-ui, sans-serif` : "system-ui, sans-serif",

    "--radius": radius,
    "--space-scale": spacing,
    "--container": container,
  };

  return vars as React.CSSProperties;
}

/** Google Fonts URL for the theme's fonts (skipped for system fonts). */
export function googleFontsHref(theme: ThemeTokens | undefined): string | null {
  const fams = new Set<string>();
  for (const f of [theme?.font?.heading, theme?.font?.body]) {
    if (f && f.trim() && !/^system/i.test(f)) fams.add(f.trim());
  }
  if (!fams.size) return null;
  const q = [...fams]
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}
