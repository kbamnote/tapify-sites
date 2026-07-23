"use client";

/**
 * Visual crop control — replaces the old "Image fit" dropdown.
 *
 * The section decides the frame (a card, a circle, a 16:9 photo); the customer
 * decides what of their photo lands inside it. So instead of three canned fit
 * options, they drag the photo to reposition it and zoom to crop in closer.
 *
 * Nothing is re-encoded: the value is just {fit,x,y,zoom}, applied as
 * object-position + scale by imageFitStyle() here and imgFit() in the PHP
 * renderer. That keeps the crop non-destructive and re-editable forever, and
 * means the original upload is never degraded by repeated crops.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { mediaSrc } from "./client-api";

export type Crop = { fit?: "cover" | "contain"; x?: number; y?: number; zoom?: number };

const DEFAULT: Required<Crop> = { fit: "cover", x: 50, y: 50, zoom: 1 };

/** Legacy string values predate the cropper; map them onto the new shape. */
function toCrop(value: unknown): Required<Crop> {
  if (typeof value === "string") {
    if (value === "contain") return { ...DEFAULT, fit: "contain" };
    if (value === "top") return { ...DEFAULT, y: 0 };
    return { ...DEFAULT };
  }
  if (value && typeof value === "object") {
    const v = value as Crop;
    return {
      fit: v.fit === "contain" ? "contain" : "cover",
      x: clamp(Number(v.x ?? 50), 0, 100),
      y: clamp(Number(v.y ?? 50), 0, 100),
      zoom: clamp(Number(v.zoom ?? 1), 1, 4),
    };
  }
  return { ...DEFAULT };
}

function clamp(n: number, lo: number, hi: number) {
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo;
}

function looksLikeMedia(v: unknown): v is string {
  return typeof v === "string" && /^(media:\d+|https?:\/\/|\/)/.test(v);
}

/**
 * Find the photo this crop applies to.
 *
 * On About/Share/Appointment it sits next to a single image prop. On
 * Gallery/Services/Team the crop is one section-wide setting over a repeater of
 * images, so there is no single sibling — preview the first one, which is what
 * the customer is looking at anyway.
 */
function findPreviewSrc(siblings?: Record<string, unknown>): string | undefined {
  if (!siblings) return undefined;
  for (const k of ["image", "photo", "cover", "logo"]) {
    if (looksLikeMedia(siblings[k])) return siblings[k];
  }
  for (const v of Object.values(siblings)) {
    if (looksLikeMedia(v)) return v;
    if (!Array.isArray(v)) continue;
    for (const item of v) {
      if (!item || typeof item !== "object") continue;
      for (const iv of Object.values(item as Record<string, unknown>)) {
        if (looksLikeMedia(iv)) return iv;
      }
    }
  }
  return undefined;
}

export default function CropField({
  value,
  onChange,
  siblings,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  /** The other props on this section/row — used to find the image to crop. */
  siblings?: Record<string, unknown>;
}) {
  const crop = toCrop(value);
  const url = mediaSrc(findPreviewSrc(siblings));
  const frameRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const set = (patch: Crop) => onChange({ ...crop, ...patch });

  /**
   * Drag maps 1:1 onto object-position: moving the pointer right should move the
   * photo right, which means *decreasing* the position percentage. The travel is
   * scaled by the zoom, because a more zoomed image has more hidden area to pan
   * across for the same pointer distance.
   */
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (crop.fit === "contain" || !url) return;
      const frame = frameRef.current;
      if (!frame) return;
      e.preventDefault();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      setDragging(true);

      const rect = frame.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const originX = crop.x;
      const originY = crop.y;

      const move = (ev: PointerEvent) => {
        const dx = ((ev.clientX - startX) / rect.width) * 100;
        const dy = ((ev.clientY - startY) / rect.height) * 100;
        set({
          x: clamp(originX - dx / crop.zoom, 0, 100),
          y: clamp(originY - dy / crop.zoom, 0, 100),
        });
      };
      const up = () => {
        setDragging(false);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    // `set` closes over the current crop, which is what each drag should start from.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [crop.x, crop.y, crop.zoom, crop.fit, url]
  );

  // Wheel-to-zoom over the frame, the way every other cropper behaves.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || crop.fit === "contain") return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      set({ zoom: clamp(crop.zoom - e.deltaY * 0.002, 1, 4) });
    };
    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => frame.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop.zoom, crop.fit]);

  if (!url) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 px-3 py-3 text-center text-[11px] text-slate-500">
        Upload an image above, then crop it here.
      </p>
    );
  }

  const contain = crop.fit === "contain";

  return (
    <div className="space-y-2">
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        className="relative w-full overflow-hidden rounded-md border border-slate-300 bg-slate-100 select-none"
        style={{ aspectRatio: "16 / 9", cursor: contain ? "default" : dragging ? "grabbing" : "grab" }}
        title={contain ? undefined : "Drag to reposition · scroll to zoom"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          draggable={false}
          className="h-full w-full"
          style={
            contain
              ? { objectFit: "contain", objectPosition: "center" }
              : {
                  objectFit: "cover",
                  objectPosition: `${crop.x}% ${crop.y}%`,
                  transform: `scale(${crop.zoom})`,
                  transformOrigin: `${crop.x}% ${crop.y}%`,
                }
          }
        />
        {/* Rule-of-thirds guides, only while actually dragging. */}
        {dragging && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-y-0 left-1/3 w-px bg-white/70" />
            <div className="absolute inset-y-0 left-2/3 w-px bg-white/70" />
            <div className="absolute inset-x-0 top-1/3 h-px bg-white/70" />
            <div className="absolute inset-x-0 top-2/3 h-px bg-white/70" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="w-9 shrink-0 text-[10px] font-semibold text-slate-500">Zoom</span>
        <input
          type="range"
          min={1}
          max={4}
          step={0.05}
          disabled={contain}
          value={crop.zoom}
          onChange={(e) => set({ zoom: Number(e.target.value) })}
          className="w-full accent-slate-900 disabled:opacity-40"
        />
        <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-slate-500">
          {crop.zoom.toFixed(1)}×
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-[11px] text-slate-600">
          <input
            type="checkbox"
            checked={contain}
            onChange={(e) => set({ fit: e.target.checked ? "contain" : "cover" })}
            className="accent-slate-900"
          />
          Show the whole image (no crop)
        </label>
        <button
          type="button"
          onClick={() => onChange({ ...DEFAULT })}
          className="rounded px-2 py-1 text-[11px] text-slate-500 hover:text-slate-900"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
