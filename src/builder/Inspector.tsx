"use client";

/**
 * Inspector — the right-hand properties panel.
 *
 * It has ZERO knowledge of any specific section. Everything it renders comes
 * from the selected section's manifest: variants, grouped fields, and which
 * style controls that section supports. That is why a brand-new section type
 * gets a full editing UI without a line of code here.
 */

import { useState } from "react";
import { useBuilder } from "./store";
import { Field } from "./fields";
import { groupFields, fieldApplies } from "./schema-types";
import type { SectionStyle } from "@/lib/types";

const STYLE_CONTROLS: { key: keyof SectionStyle; label: string; options: string[] }[] = [
  { key: "paddingY", label: "Spacing", options: ["none", "sm", "md", "lg", "xl"] },
  { key: "align", label: "Alignment", options: ["left", "center", "right"] },
  { key: "bg", label: "Background", options: ["default", "surface", "primary", "dark", "image", "none"] },
  { key: "radius", label: "Corners", options: ["none", "sm", "md", "lg", "xl"] },
  { key: "animation", label: "Animation", options: ["none", "fade", "slide-up", "zoom"] },
];

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
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

export default function Inspector() {
  const doc = useBuilder((s) => s.doc);
  const pageId = useBuilder((s) => s.pageId);
  const selectedId = useBuilder((s) => s.selectedId);
  const manifests = useBuilder((s) => s.manifests);
  const setProp = useBuilder((s) => s.setProp);
  const setStyle = useBuilder((s) => s.setStyle);
  const setVariant = useBuilder((s) => s.setVariant);

  const page = doc?.pages.find((p) => p.id === pageId) ?? doc?.pages[0];
  const section = page?.sections.find((s) => s.id === selectedId);

  if (!section) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <p className="text-xs leading-relaxed text-slate-400">
          Select a section on the left
          <br />
          to edit its content.
        </p>
      </div>
    );
  }

  const manifest = manifests[section.type];
  if (!manifest) {
    return (
      <div className="p-3">
        <p className="rounded border border-amber-300 bg-amber-50 p-2 text-[11px] text-amber-800">
          No manifest for “{section.type}”. This editor may be out of date.
        </p>
      </div>
    );
  }

  const props = (section.props ?? {}) as Record<string, unknown>;
  const groups = groupFields(manifest.props);
  const supports = manifest.style?.supports ?? [];
  const styleControls = STYLE_CONTROLS.filter((c) => supports.includes(c.key as string));

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-3 py-3">
        <p className="text-sm font-bold text-slate-900">{manifest.label}</p>
        {manifest.description && <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{manifest.description}</p>}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Variants — the section's design options, straight from the manifest. */}
        {manifest.variants.length > 1 && (
          <Accordion title="Design" defaultOpen>
            <div className="grid grid-cols-1 gap-1.5">
              {manifest.variants.map((v) => {
                const active = (section.variant ?? manifest.defaults?.variant) === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariant(section.id, v.id)}
                    className={`rounded-md border px-2.5 py-2 text-left text-[11px] transition-colors ${
                      active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </Accordion>
        )}

        {/* Content — grouped exactly as the manifest declares. */}
        {groups.map((g, gi) => {
          const visible = g.fields.filter((f) => fieldApplies(f, section.variant));
          if (!visible.length) return null;
          return (
            <Accordion key={g.group} title={g.group} defaultOpen={gi === 0}>
              {visible.map((f) => (
                <Field
                  key={f.key}
                  field={f}
                  variant={section.variant}
                  value={props[f.key]}
                  onChange={(v) => setProp(section.id, f.key, v)}
                />
              ))}
            </Accordion>
          );
        })}

        {/* Style — only the controls this section supports. */}
        {!!styleControls.length && (
          <Accordion title="Style">
            {styleControls.map((c) => (
              <div key={c.key as string}>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700">{c.label}</label>
                <div className="flex flex-wrap gap-1">
                  {c.options.map((o) => {
                    const active = (section.style?.[c.key] as string | undefined) === o;
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setStyle(section.id, c.key, o)}
                        className={`rounded border px-2 py-1 text-[10px] capitalize transition-colors ${
                          active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {supports.includes("bgMedia") && section.style?.bg === "image" && (
              <Field
                field={{ key: "bgMedia", type: "media", label: "Background image", help: "Without an image this section falls back to your brand colour." }}
                value={section.style?.bgMedia}
                onChange={(v) => setStyle(section.id, "bgMedia", v)}
              />
            )}

            {supports.includes("overlay") && section.style?.bg === "image" && (
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700">
                  Image darkness ({Math.round((section.style?.overlay ?? 0.5) * 100)}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={section.style?.overlay ?? 0.5}
                  onChange={(e) => setStyle(section.id, "overlay", Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </Accordion>
        )}
      </div>
    </div>
  );
}
