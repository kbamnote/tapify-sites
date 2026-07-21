"use client";

/**
 * Theme panel — the site-wide look, edited as design TOKENS, never raw CSS.
 *
 * Every control here writes to doc.theme, which the canvas turns into CSS
 * variables (lib/theme.ts). Sections read those variables, so one change here
 * restyles the whole website at once and the customer can never end up with a
 * half-styled page. There is deliberately no light/dark toggle: the renderer
 * has no dark mode yet, so shipping that control would be a lie.
 */

import { useState } from "react";
import { useBuilder } from "./store";
import type { ThemeTokens } from "@/lib/types";

/* ------------------------------------------------------------------ presets */

/**
 * Curated starting points. Each carries a COMPLETE colour set so applying one
 * fully restyles the site rather than leaving a mix of old and new. Kept
 * client-side on purpose: the backend has one preset today, so threading the
 * API theme list through the whole loader would be plumbing for no payoff —
 * a clean follow-up once that library grows.
 */
interface Preset {
  id: string;
  label: string;
  swatch: string;
  tokens: Partial<ThemeTokens>;
}

const LIGHT_SURFACES = { bg: "#FFFFFF", surface: "#F5F7FB", text: "#111827", muted: "#6B7280", border: "#E5E7EB" };

const PRESETS: Preset[] = [
  {
    id: "tapify-blue",
    label: "Tapify Blue",
    swatch: "#2563EB",
    tokens: {
      color: { primary: "#2563EB", secondary: "#1D4ED8", accent: "#F7941D", ...LIGHT_SURFACES },
      font: { heading: "Poppins", body: "Poppins" }, radius: "md", spacing: "comfortable",
    },
  },
  {
    id: "navy-gold",
    label: "Navy & Gold",
    swatch: "#1B3A6B",
    tokens: {
      color: { primary: "#1B3A6B", secondary: "#2C5AA0", accent: "#F7941D", ...LIGHT_SURFACES },
      font: { heading: "Playfair Display", body: "Lato" }, radius: "sm", spacing: "comfortable",
    },
  },
  {
    id: "emerald",
    label: "Emerald",
    swatch: "#059669",
    tokens: {
      color: { primary: "#059669", secondary: "#047857", accent: "#F59E0B", ...LIGHT_SURFACES },
      font: { heading: "Montserrat", body: "Inter" }, radius: "lg", spacing: "comfortable",
    },
  },
  {
    id: "rose",
    label: "Rose",
    swatch: "#E11D48",
    tokens: {
      color: { primary: "#E11D48", secondary: "#BE123C", accent: "#F97316", ...LIGHT_SURFACES },
      font: { heading: "Poppins", body: "Nunito" }, radius: "xl", spacing: "comfortable",
    },
  },
  {
    id: "violet",
    label: "Violet",
    swatch: "#7C3AED",
    tokens: {
      color: { primary: "#7C3AED", secondary: "#6D28D9", accent: "#EC4899", ...LIGHT_SURFACES },
      font: { heading: "Raleway", body: "Work Sans" }, radius: "lg", spacing: "comfortable",
    },
  },
  {
    id: "charcoal",
    label: "Charcoal",
    swatch: "#111827",
    tokens: {
      color: { primary: "#111827", secondary: "#374151", accent: "#F59E0B", ...LIGHT_SURFACES },
      font: { heading: "DM Sans", body: "DM Sans" }, radius: "sm", spacing: "spacious",
    },
  },
];

/* ------------------------------------------------------------------- fields */

/** Popular, well-hinted Google families the renderer already knows how to load. */
const FONTS = [
  "Poppins", "Inter", "Montserrat", "Roboto", "Open Sans", "Lato", "Nunito",
  "Work Sans", "Raleway", "DM Sans", "Rubik", "Source Sans 3",
  "Playfair Display", "Merriweather", "Lora",
];

const COLOR_FALLBACK: Record<string, string> = {
  primary: "#2563EB", secondary: "#1D4ED8", accent: "#F7941D",
  bg: "#FFFFFF", surface: "#F5F7FB", text: "#111827", muted: "#6B7280", border: "#E5E7EB",
};

const BRAND_COLORS: { key: string; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
];

const SURFACE_COLORS: { key: string; label: string }[] = [
  { key: "bg", label: "Page background" },
  { key: "surface", label: "Card surface" },
  { key: "text", label: "Text" },
  { key: "muted", label: "Muted text" },
  { key: "border", label: "Borders" },
];

const RADIUS = ["none", "sm", "md", "lg", "xl", "pill"] as const;
const SPACING = ["compact", "comfortable", "spacious"] as const;
const CONTAINER = ["narrow", "normal", "wide", "full"] as const;

function isHex(v: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());
}

function Group({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</span>
        <span className={`text-slate-400 transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <div className="space-y-3 px-3 pb-4">{children}</div>}
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const swatch = isHex(value) ? value : "#000000";
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={swatch}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="h-7 w-9 shrink-0 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
        aria-label={label}
      />
      <div className="min-w-0 flex-1">
        <label className="block text-[11px] font-semibold text-slate-700">{label}</label>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="w-[76px] shrink-0 rounded border border-slate-300 bg-white px-1.5 py-1 text-[11px] uppercase text-slate-900 outline-none focus:border-slate-900"
      />
    </div>
  );
}

function Segmented({ value, options, onChange }: { value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded border px-2 py-1 text-[10px] capitalize transition-colors ${
            value === o ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------- panel */

export default function ThemePanel() {
  const theme = useBuilder((s) => s.doc?.theme);
  const applyTheme = useBuilder((s) => s.applyTheme);
  const setThemeColor = useBuilder((s) => s.setThemeColor);
  const setThemeFont = useBuilder((s) => s.setThemeFont);
  const setThemeToken = useBuilder((s) => s.setThemeToken);

  const colors = (theme?.color ?? {}) as Record<string, string | undefined>;
  const color = (k: string) => colors[k] ?? COLOR_FALLBACK[k] ?? "#000000";
  const activePreset = theme?.preset;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-3 py-3">
        <p className="text-sm font-bold text-slate-900">Theme</p>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
          Colours, fonts and shape for the whole website. Every change previews live.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Group title="Presets" defaultOpen>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map((p) => {
              const active = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyTheme({ ...p.tokens, preset: p.id })}
                  className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-[11px] transition-colors ${
                    active ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <span className="h-4 w-4 shrink-0 rounded-full border border-black/10" style={{ background: p.swatch }} />
                  <span className="truncate text-slate-700">{p.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] leading-snug text-slate-400">
            A preset is a starting point — tweak anything below afterwards.
          </p>
        </Group>

        <Group title="Brand colours" defaultOpen>
          {BRAND_COLORS.map((c) => (
            <ColorRow key={c.key} label={c.label} value={color(c.key)} onChange={(v) => setThemeColor(c.key, v)} />
          ))}
        </Group>

        <Group title="Surfaces & text">
          {SURFACE_COLORS.map((c) => (
            <ColorRow key={c.key} label={c.label} value={color(c.key)} onChange={(v) => setThemeColor(c.key, v)} />
          ))}
        </Group>

        <Group title="Fonts" defaultOpen>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">Headings</label>
            <select
              value={theme?.font?.heading ?? ""}
              onChange={(e) => setThemeFont("heading", e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="">System default</option>
              {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">Body text</label>
            <select
              value={theme?.font?.body ?? ""}
              onChange={(e) => setThemeFont("body", e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-slate-900"
            >
              <option value="">System default</option>
              {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          {(theme?.font?.heading || theme?.font?.body) && (
            <p
              className="rounded border border-slate-200 bg-slate-50 px-2 py-2 text-center text-slate-800"
              style={{ fontFamily: theme?.font?.heading ? `"${theme.font.heading}", sans-serif` : undefined }}
            >
              <span className="block text-sm font-bold">The quick brown fox</span>
              <span className="text-[11px]" style={{ fontFamily: theme?.font?.body ? `"${theme.font.body}", sans-serif` : undefined }}>
                jumps over the lazy dog
              </span>
            </p>
          )}
        </Group>

        <Group title="Shape & spacing">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">Corner rounding</label>
            <Segmented value={theme?.radius ?? "md"} options={RADIUS} onChange={(v) => setThemeToken("radius", v)} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">Spacing</label>
            <Segmented value={theme?.spacing ?? "comfortable"} options={SPACING} onChange={(v) => setThemeToken("spacing", v)} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">Content width</label>
            <Segmented value={theme?.container ?? "normal"} options={CONTAINER} onChange={(v) => setThemeToken("container", v)} />
          </div>
        </Group>
      </div>
    </div>
  );
}
