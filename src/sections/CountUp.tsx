"use client";

/**
 * CountUp — animates a number from 0 to its value the first time it scrolls into
 * view. Used by the Stats section's "Animate counting up" option. Respects
 * prefers-reduced-motion (jumps straight to the final number).
 */
import { useEffect, useRef, useState } from "react";

export default function CountUp({ value, durationMs = 1600 }: { value: number; durationMs?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }

    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started) {
            started = true;
            const start = performance.now();
            const tick = (t: number) => {
              const p = Math.min(1, (t - start) / durationMs);
              setN(Math.round(value * (1 - Math.pow(1 - p, 3)))); // easeOutCubic
              if (p < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, durationMs]);

  return <span ref={ref}>{n.toLocaleString("en-IN")}</span>;
}
