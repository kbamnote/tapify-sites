"use client";

/**
 * Carousel — a real slider with arrows, dots, autoplay and swipe.
 *
 * Used by the "Slider" variants (Gallery, Testimonials). The old slider was a
 * passive overflow-x strip with no controls, which read as broken on desktop
 * (you couldn't advance it). This wraps the same scroll-snap track with proper
 * controls so it works with a mouse, touch, or on its own.
 *
 * Kept deliberately simple: it drives the native scroll position, so swipe and
 * keyboard scrolling keep working and there's no layout maths to get wrong.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export default function Carousel({
  slides,
  autoplayMs = 4000,
}: {
  slides: ReactNode[];
  autoplayMs?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = ((i % count) + count) % count;
      const slide = track.children[clamped] as HTMLElement | undefined;
      if (slide) track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
    },
    [count]
  );

  // Keep the active dot in sync with the scroll position (works for swipe too).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let best = 0;
        let bd = Infinity;
        Array.from(track.children).forEach((c, i) => {
          const el = c as HTMLElement;
          const cc = el.offsetLeft + el.offsetWidth / 2;
          const d = Math.abs(cc - center);
          if (d < bd) { bd = d; best = i; }
        });
        setActive(best);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Autoplay, paused on hover/focus.
  useEffect(() => {
    if (!autoplayMs || count < 2 || paused) return;
    const id = setInterval(() => goTo(active + 1), autoplayMs);
    return () => clearInterval(id);
  }, [active, autoplayMs, count, paused, goTo]);

  const arrowStyle: CSSProperties = {
    background: "var(--color-bg)",
    color: "var(--color-text)",
    border: "1px solid var(--color-border)",
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <div key={i} className="shrink-0 basis-[85%] snap-start sm:basis-[46%] lg:basis-[31%]">
            {s}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => goTo(active - 1)}
            style={arrowStyle}
            className="absolute left-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-lg shadow-md transition-opacity hover:opacity-80"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => goTo(active + 1)}
            style={arrowStyle}
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-lg shadow-md transition-opacity hover:opacity-80"
          >
            ›
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === active ? 20 : 8,
                  background: i === active ? "var(--color-primary)" : "var(--color-border)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
