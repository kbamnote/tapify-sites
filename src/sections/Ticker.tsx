import type { SectionProps } from "@/lib/types";

interface TickerItem { text?: string; icon?: string; href?: string }
interface TickerProps {
  items?: TickerItem[];
  /** "static" = a fixed announcement bar, mirroring the PHP renderer. */
  speed?: "slow" | "normal" | "fast" | "static";
  /** Optional bar colour that overrides the variant, without touching the theme. */
  bgColor?: string;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  separator?: string;
}

/** Seconds per character, so a long strip does not race past. */
const RATE: Record<string, number> = { slow: 0.28, normal: 0.18, fast: 0.11 };

/**
 * White or near-black text for a bar painted `hex`. Deliberately the SAME
 * formula as SiteRenderer::readableOn (simple luma, dark text above 0.6) rather
 * than a WCAG contrast pick: the two can disagree on mid-tone colours, and the
 * canvas must show the text colour the published page will actually use.
 */
function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const luma = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return luma > 0.6 ? "#111827" : "#FFFFFF";
}

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

  const custom = /^#[0-9a-f]{6}$/i.test(props.bgColor ?? "") ? (props.bgColor as string) : "";
  const bg = custom
    || (variant === "accent" ? "var(--color-accent)"
      : variant === "light" ? "var(--color-surface)"
      : "var(--color-primary)");
  const fg = custom ? readableOn(custom) : variant === "light" ? "var(--color-text)" : "#ffffff";

  const set = (hidden: boolean) => (
    <div className="tf-tkset" aria-hidden={hidden || undefined}>
      {items.map((it, i) => {
        const href = (it.href ?? "").trim();
        const external = /^(https?:)?\/\//i.test(href);
        return (
          <span key={i} className="tf-tkitem">
            {it.icon ? <span className="tf-tkicon">{it.icon}</span> : null}
            {href ? (
              <a
                className="tf-tklink"
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {it.text}
              </a>
            ) : (
              it.text
            )}
            <span className="tf-tksep" aria-hidden="true">{sep}</span>
          </span>
        );
      })}
    </div>
  );

  const isStatic = props.speed === "static";

  return (
    <section
      className={`tf-ticker${isStatic ? " tf-tkstatic" : props.pauseOnHover !== false ? " tf-tkpause" : ""}`}
      style={{ background: bg, color: fg }}
    >
      {isStatic ? (
        // A fixed bar: one set, nothing moving, nothing announced twice.
        set(false)
      ) : (
        <div
          className={`tf-tktrack${props.direction === "right" ? " tf-tkrev" : ""}`}
          style={{ animationDuration: `${dur}s` }}
        >
          {set(false)}
          {set(true)}
        </div>
      )}
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
        .tf-tklink{color:inherit;text-decoration:none}
        .tf-tklink:hover{text-decoration:underline}
        .tf-tkstatic{padding:8px 0}
        .tf-tkstatic .tf-tkset{flex-wrap:wrap;justify-content:center;white-space:normal;gap:8px 16px;padding:0 16px}
        .tf-tkstatic .tf-tksep{display:none}
        .tf-tkstatic .tf-tklink{display:inline-block;border:1px solid currentColor;border-radius:4px;padding:3px 12px}
        .tf-tkstatic .tf-tklink:hover{text-decoration:none;background:rgba(255,255,255,.12)}
      `}</style>
    </section>
  );
}
