import type { SectionProps } from "@/lib/types";

interface TickerItem { text?: string; icon?: string }
interface TickerProps {
  items?: TickerItem[];
  speed?: "slow" | "normal" | "fast";
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  separator?: string;
}

/** Seconds per character, so a long strip does not race past. */
const RATE: Record<string, number> = { slow: 0.28, normal: 0.18, fast: 0.11 };

/**
 * Scrolling notice — a thin strip of text moving sideways, for offers,
 * delivery notices or a safety warning. Reads well directly under the hero.
 *
 * Mirrors the PHP `secTicker` exactly: the message set is duplicated and the
 * track animates to -50%, which loops with no visible seam. Pure CSS, so the
 * editor canvas and the published page render identically and no client
 * JavaScript is needed.
 *
 * The duplicate set is aria-hidden — a screen reader should hear each notice
 * once, not twice — and the whole thing stops moving under
 * prefers-reduced-motion, which is precisely what that setting exists for.
 */
export default function Ticker({ section, props }: SectionProps<TickerProps>) {
  const items = (props.items ?? []).filter((i) => (i.text ?? "").trim() !== "");
  if (!items.length) return null;

  const variant = section.variant ?? "dark";
  const sep = (props.separator ?? "").trim() || "•";
  const chars = items.reduce((a, i) => a + (i.text ?? "").length + 6, 0);
  const dur = Math.max(14, Math.round(chars * (RATE[props.speed ?? "normal"] ?? RATE.normal)));

  const bg =
    variant === "accent" ? "var(--color-accent)"
    : variant === "light" ? "var(--color-surface)"
    : "var(--color-primary)";
  const fg = variant === "light" ? "var(--color-text)" : "#ffffff";

  const set = (hidden: boolean) => (
    <div className="tf-tkset" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <span key={i} className="tf-tkitem">
          {it.icon ? <span className="tf-tkicon">{it.icon}</span> : null}
          {it.text}
          <span className="tf-tksep" aria-hidden="true">{sep}</span>
        </span>
      ))}
    </div>
  );

  return (
    <section
      className={`tf-ticker${props.pauseOnHover !== false ? " tf-tkpause" : ""}`}
      style={{ background: bg, color: fg }}
    >
      <div
        className={`tf-tktrack${props.direction === "right" ? " tf-tkrev" : ""}`}
        style={{ animationDuration: `${dur}s` }}
      >
        {set(false)}
        {set(true)}
      </div>
      <style>{`
        .tf-ticker{overflow:hidden;position:relative;padding:11px 0;font-size:.86rem;font-weight:600;letter-spacing:.01em}
        .tf-tktrack{display:flex;width:max-content;animation-name:tf-tkscroll;animation-timing-function:linear;animation-iteration-count:infinite}
        .tf-tktrack.tf-tkrev{animation-direction:reverse}
        .tf-tkpause:hover .tf-tktrack,.tf-tkpause:focus-within .tf-tktrack{animation-play-state:paused}
        .tf-tkset{display:flex;flex:0 0 auto;align-items:center;white-space:nowrap}
        .tf-tkitem{display:inline-flex;align-items:center;gap:8px;padding:0 4px}
        .tf-tkicon{font-size:1.02em;line-height:1}
        .tf-tksep{opacity:.45;padding:0 18px 0 22px}
        @keyframes tf-tkscroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @media(prefers-reduced-motion:reduce){
          .tf-tktrack{animation:none}
          .tf-ticker{overflow-x:auto}
          .tf-tkset+.tf-tkset{display:none}
        }
      `}</style>
    </section>
  );
}
