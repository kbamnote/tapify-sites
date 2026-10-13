import type { CSSProperties } from "react";
import type { SectionProps } from "@/lib/types";
import { SectionShell, SectionHeader } from "./_shared";
import { mediaUrl } from "@/lib/api";

interface LogoItem { image?: string; name?: string; href?: string }
interface LogosProps {
  label?: string; heading?: string; sub?: string;
  items?: LogoItem[];
  columns?: "3" | "4" | "5" | "6";
  speed?: "slow" | "normal" | "fast";
  greyscale?: boolean;
}

/**
 * Logo strip — stockists, stocked brands, press, clients.
 *
 * Mirrors SiteRenderer::secLogos; the two renderers must agree.
 *
 * Two shapes of the same list. A grid when the logos are the point and someone
 * will read them; a scrolling row when they are reassurance in passing and
 * there are too many to lay out.
 *
 * The marquee prints the list TWICE and travels exactly half the track, so the
 * second copy stands where the first began and the loop has no seam. Printing
 * it once and resetting leaves a visible jump every cycle.
 */

const CSS = `
.tf-logos{display:grid;grid-template-columns:repeat(var(--lg-cols,5),minmax(0,1fr));gap:26px 20px;align-items:center}
.tf-logo{display:grid;place-items:center;padding:10px}
.tf-logo img{max-width:100%;max-height:var(--lg-h,56px);width:auto;height:auto;object-fit:contain}
.tf-logos-mute .tf-logo img{filter:grayscale(1);opacity:.62;transition:filter .2s ease,opacity .2s ease}
.tf-logos-mute .tf-logo:hover img{filter:none;opacity:1}
@media(max-width:900px){.tf-logos{grid-template-columns:repeat(3,minmax(0,1fr));gap:20px 14px}}
@media(max-width:520px){.tf-logos{grid-template-columns:repeat(2,minmax(0,1fr))}}
.tf-lgm{overflow:hidden;position:relative;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
  mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.tf-lgm-track{display:flex;width:max-content;gap:var(--lg-gap,52px);
  animation:tf-lgm-run var(--lg-dur,34s) linear infinite}
.tf-lgm:hover .tf-lgm-track{animation-play-state:paused}
.tf-lgm .tf-logo{padding:0;flex:0 0 auto}
@keyframes tf-lgm-run{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media(prefers-reduced-motion:reduce){
  /* Motion nobody asked for, running forever, at the edge of vision. Stop it
     and let the row be scrolled by hand instead. */
  .tf-lgm-track{animation:none}
  .tf-lgm{overflow-x:auto;-webkit-mask-image:none;mask-image:none}
}
`;

const DURATION = { slow: "58s", normal: "34s", fast: "20s" } as const;

export default function Logos({ section, props }: SectionProps<LogosProps>) {
  const marquee = section.variant === "marquee";
  const cols = ["3", "4", "5", "6"].includes(props.columns ?? "") ? props.columns : "5";
  const mute = props.greyscale !== false;

  // A logo with no picture is nothing, so it never reaches the page.
  const items = (props.items ?? [])
    .map((it) => ({ ...it, src: mediaUrl(it.image) }))
    .filter((it) => !!it.src);
  if (!items.length) return null;

  const row = items.map((it, i) => {
    const img = (
      // Lazy below the fold, but a marquee that starts mid-animation with half
      // its logos missing looks broken, so those load eagerly.
      <img src={it.src} alt={it.name ?? ""} loading={marquee ? undefined : "lazy"} />
    );
    const linked = !!it.href?.trim() && /^(https?:\/\/|\/)/i.test(it.href.trim());
    return linked
      ? <a className="tf-logo" key={i} href={it.href} target="_blank" rel="noopener noreferrer">{img}</a>
      : <div className="tf-logo" key={i}>{img}</div>;
  });

  return (
    <SectionShell section={section}>
      <style>{CSS}</style>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
      {marquee ? (
        <div className={"tf-lgm" + (mute ? " tf-logos-mute" : "")}
             style={{ "--lg-dur": DURATION[props.speed ?? "normal"] } as CSSProperties}>
          <div className="tf-lgm-track">
            {row}
            {/* The duplicate is decoration: a screen reader should hear the
                list once, not twice. */}
            <span style={{ display: "contents" }} aria-hidden>{row}</span>
          </div>
        </div>
      ) : (
        <div className={"tf-logos" + (mute ? " tf-logos-mute" : "")}
             style={{ "--lg-cols": cols } as CSSProperties}>
          {row}
        </div>
      )}
    </SectionShell>
  );
}
