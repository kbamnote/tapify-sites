"use client";

/**
 * The field registry — one widget per `type` in builder/schema/README.md.
 *
 * The Inspector NEVER knows what a "hero" is. It walks a manifest's `props` and
 * renders these widgets. That is the whole extensibility story: a new section is
 * a JSON manifest, not editor code. Adding a new *field type* is the only change
 * that requires touching this file (and the app's equivalent).
 */

import { useRef, useState } from "react";
import type { FieldDef } from "./schema-types";
import { itemLabel } from "./schema-types";
import type { Link as LinkT } from "@/lib/types";
import HoursEditor from "./HoursEditor";
import { useBuilder } from "./store";
import { uploadMedia, mediaSrc, ApiError, NotSignedInError } from "./client-api";

/* ------------------------------------------------------------------ chrome */

function Label({ field }: { field: FieldDef }) {
  return (
    <div className="mb-1 flex items-baseline justify-between gap-2">
      <label className="text-[11px] font-semibold text-slate-700">
        {field.label ?? field.key}
        {field.required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {field.maxLength && <span className="text-[10px] text-slate-400">max {field.maxLength}</span>}
    </div>
  );
}

function Help({ field }: { field: FieldDef }) {
  if (!field.help) return null;
  return <p className="mt-1 text-[10px] leading-snug text-slate-500">{field.help}</p>;
}

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-slate-900";

/* ------------------------------------------------------------- field types */

export interface FieldProps {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}

function TextField({ field, value, onChange }: FieldProps) {
  return (
    <input
      className={inputCls}
      type="text"
      value={(value as string) ?? ""}
      maxLength={field.maxLength}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function TextareaField({ field, value, onChange }: FieldProps) {
  return (
    <textarea
      className={`${inputCls} min-h-20 resize-y`}
      value={(value as string) ?? ""}
      maxLength={field.maxLength}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function NumberField({ field, value, onChange }: FieldProps) {
  return (
    <input
      className={inputCls}
      type="number"
      value={value === undefined || value === null ? "" : String(value)}
      min={field.min}
      max={field.max}
      onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
    />
  );
}

function ToggleField({ value, onChange }: FieldProps) {
  const on = value === true;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-slate-900" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`}
      />
    </button>
  );
}

function SelectField({ field, value, onChange }: FieldProps) {
  return (
    <select className={inputCls} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">—</option>
      {(field.options ?? []).map((o) => (
        <option key={o} value={o}>
          {o.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </option>
      ))}
    </select>
  );
}

function ColorField({ value, onChange }: FieldProps) {
  const v = (value as string) ?? "#000000";
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={/^#[0-9a-f]{6}$/i.test(v) ? v : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-9 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
      />
      <input className={inputCls} value={v} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/**
 * Media picker: upload a file OR paste a URL / media ref. Uploads go to the
 * media library and the document stores the returned "media:<id>" — never a raw
 * URL — so the file can later be replaced or CDN-swapped without touching any
 * site JSON. A pasted https URL is still accepted and stored verbatim.
 */
function MediaField({ field, value, onChange }: FieldProps) {
  const v = (value as string) ?? "";
  const siteId = useBuilder((s) => s.siteId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = mediaSrc(v);

  async function upload(file: File) {
    setError(null);
    setBusy(true);
    try {
      const media = await uploadMedia(file, siteId);
      onChange(media.ref); // store "media:<id>", not the URL
    } catch (e) {
      if (e instanceof NotSignedInError) {
        setError("Please sign in again to upload.");
      } else {
        setError(e instanceof ApiError ? e.message : "Upload failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void upload(f);
        }}
        className={`relative flex flex-col items-center justify-center gap-1 rounded-md border border-dashed px-3 py-4 text-center transition-colors ${
          drag ? "border-slate-900 bg-slate-50" : "border-slate-300"
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-20 w-full rounded object-contain" />
        ) : (
          <span className="text-[11px] text-slate-500">
            {busy ? "Uploading…" : "Drop an image here, or"}
          </span>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-900 disabled:opacity-50"
          >
            {busy ? "Uploading…" : preview ? "Replace" : "Upload"}
          </button>
          {v && !busy && (
            <button
              type="button"
              onClick={() => { onChange(""); setError(null); }}
              className="rounded px-2 py-1 text-[11px] text-slate-500 hover:text-rose-600"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />
      </div>

      {/* Escape hatch: paste a URL or an existing media ref directly. */}
      <input
        className={inputCls}
        value={v}
        placeholder={field.placeholder ?? "https://… or media:12"}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-[10px] text-rose-600">{error}</p>}
    </div>
  );
}

function LinkField({ value, onChange }: FieldProps) {
  const v = (value as LinkT) ?? {};
  const set = (patch: Partial<LinkT>) => onChange({ ...v, ...patch });
  return (
    <div className="space-y-1.5 rounded-md border border-slate-200 bg-slate-50 p-2">
      <input className={inputCls} placeholder="Button text" value={v.text ?? ""} onChange={(e) => set({ text: e.target.value })} />
      <input className={inputCls} placeholder="Link (#contact or https://…)" value={v.href ?? ""} onChange={(e) => set({ href: e.target.value })} />
      <div className="flex items-center gap-2">
        <select className={inputCls} value={v.style ?? "primary"} onChange={(e) => set({ style: e.target.value as LinkT["style"] })}>
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="ghost">Ghost</option>
          <option value="link">Text link</option>
        </select>
        <label className="flex shrink-0 items-center gap-1 text-[10px] text-slate-600">
          <input type="checkbox" checked={!!v.newTab} onChange={(e) => set({ newTab: e.target.checked })} />
          New tab
        </label>
      </div>
    </div>
  );
}

function ListField({ field, value, onChange }: FieldProps) {
  const items = Array.isArray(value) ? (value as string[]) : [];
  const setAt = (i: number, s: string) => onChange(items.map((x, j) => (j === i ? s : x)));
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex gap-1">
          <input className={inputCls} value={it} onChange={(e) => setAt(i, e.target.value)} />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="px-1.5 text-xs text-slate-400 hover:text-rose-600">
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className="text-[11px] font-semibold text-slate-700 hover:underline">
        + {field.addLabel ?? "Add"}
      </button>
    </div>
  );
}

function RepeaterField({ field, value, onChange, variant }: FieldProps & { variant?: string }) {
  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const [open, setOpen] = useState<number | null>(items.length ? 0 : null);

  const atMax = field.max !== undefined && items.length >= field.max;
  const atMin = field.min !== undefined && items.length <= field.min;

  const update = (i: number, patch: Record<string, unknown>) =>
    onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen(j);
  };

  return (
    <div className="space-y-1.5">
      {!items.length && field.emptyHint && (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-2 text-[10px] leading-snug text-slate-500">
          {field.emptyHint}
        </p>
      )}

      {items.map((item, i) => (
        <div key={i} className="overflow-hidden rounded-md border border-slate-200">
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5">
            <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex-1 truncate text-left text-[11px] font-semibold text-slate-700">
              {itemLabel(field.itemLabel, item, `Item ${i + 1}`)}
            </button>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-1 text-[10px] text-slate-400 disabled:opacity-30 hover:text-slate-900">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="px-1 text-[10px] text-slate-400 disabled:opacity-30 hover:text-slate-900">↓</button>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              disabled={atMin}
              title={atMin ? `At least ${field.min} required` : "Remove"}
              className="px-1 text-[10px] text-slate-400 disabled:opacity-30 hover:text-rose-600"
            >
              ✕
            </button>
          </div>

          {open === i && (
            <div className="space-y-2.5 border-t border-slate-200 p-2.5">
              {(field.fields ?? []).map((sub) => (
                <Field
                  key={sub.key}
                  field={sub}
                  variant={variant}
                  value={item[sub.key]}
                  onChange={(v) => update(i, { [sub.key]: v })}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        disabled={atMax}
        onClick={() => {
          onChange([...items, {}]);
          setOpen(items.length);
        }}
        className="text-[11px] font-semibold text-slate-700 hover:underline disabled:opacity-40"
        title={atMax ? `Maximum ${field.max}` : undefined}
      >
        + {field.addLabel ?? "Add item"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------- dispatcher */

export function Field({
  field,
  value,
  onChange,
  variant,
}: FieldProps & { variant?: string }) {
  const inline = field.type === "toggle";

  const control = (() => {
    switch (field.type) {
      case "textarea":
      case "richtext":
        return <TextareaField field={field} value={value} onChange={onChange} />;
      case "number":
        return <NumberField field={field} value={value} onChange={onChange} />;
      case "toggle":
        return <ToggleField field={field} value={value} onChange={onChange} />;
      case "select":
        return <SelectField field={field} value={value} onChange={onChange} />;
      case "color":
        return <ColorField field={field} value={value} onChange={onChange} />;
      case "media":
        return <MediaField field={field} value={value} onChange={onChange} />;
      case "icon":
        return <TextField field={{ ...field, placeholder: field.placeholder ?? "lucide icon name" }} value={value} onChange={onChange} />;
      case "link":
        return <LinkField field={field} value={value} onChange={onChange} />;
      case "list":
        return <ListField field={field} value={value} onChange={onChange} />;
      case "repeater":
        return <RepeaterField field={field} value={value} onChange={onChange} variant={variant} />;
      case "hours":
        // Self-contained: edits the site-wide doc.business.hours via the store,
        // so it ignores the section-prop value/onChange.
        return <HoursEditor />;
      case "text":
        return <TextField field={field} value={value} onChange={onChange} />;
      default:
        // An unknown type means the manifest is ahead of this editor — say so
        // rather than silently dropping the customer's data.
        return (
          <p className="rounded border border-amber-300 bg-amber-50 p-1.5 text-[10px] text-amber-800">
            Unsupported field type “{field.type}” — update the editor.
          </p>
        );
    }
  })();

  if (inline) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <label className="text-[11px] font-semibold text-slate-700">{field.label ?? field.key}</label>
          {control}
        </div>
        <Help field={field} />
      </div>
    );
  }

  return (
    <div>
      <Label field={field} />
      {control}
      <Help field={field} />
    </div>
  );
}
