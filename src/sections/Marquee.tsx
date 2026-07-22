import type { ReactNode } from "react";

/**
 * Marquee — cards scroll continuously in a seamless loop (a "ticker").
 *
 * An alternative to Carousel for the same section content. Pure CSS animation,
 * so it needs no client JavaScript and renders identically in the editor and on
 * the published PHP page. The slide set is duplicated and the track animates to
 * -50%, which makes the loop seamless. Pauses on hover; respects
 * prefers-reduced-motion.
 */
export default function Marquee({
  slides,
  secsPerSlide = 5,
}: {
  slides: ReactNode[];
  secsPerSlide?: number;
}) {
  if (!slides.length) return null;
  const dur = Math.max(16, slides.length * secsPerSlide);

  return (
    <div className="tf-mq-wrap">
      <div className="tf-mq-track" style={{ animationDuration: `${dur}s` }}>
        {[...slides, ...slides].map((s, i) => (
          <div key={i} className="tf-mq-slide">{s}</div>
        ))}
      </div>
      <style>{`
        .tf-mq-wrap{overflow:hidden;position:relative}
        .tf-mq-track{display:flex;width:max-content;animation-name:tf-mqscroll;animation-timing-function:linear;animation-iteration-count:infinite}
        .tf-mq-wrap:hover .tf-mq-track{animation-play-state:paused}
        .tf-mq-slide{flex:0 0 260px;margin-right:24px}
        @media(min-width:768px){.tf-mq-slide{flex:0 0 320px}}
        @keyframes tf-mqscroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @media(prefers-reduced-motion:reduce){.tf-mq-track{animation:none;overflow-x:auto;max-width:100%}}
      `}</style>
    </div>
  );
}
