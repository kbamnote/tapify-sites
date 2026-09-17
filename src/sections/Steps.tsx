import type { CSSProperties } from "react";
import type { SectionProps, Link as LinkT } from "@/lib/types";
import { SectionShell, SectionHeader, CtaButton, isDarkBg } from "./_shared";
import { STEPS_CSS } from "./advisorStyles";

interface Step { symbol?: string; title?: string; text?: string; color?: string }
interface StepsProps { label?: string; heading?: string; sub?: string; items?: Step[]; cta?: LinkT }

/** Steps / journey timeline — mirrors SiteRenderer::secSteps. */
export default function Steps({ section, props }: SectionProps<StepsProps>) {
  const items = (props.items ?? []).filter((it) => (it.title ?? "").trim());
  if (!items.length) return null;
  const variant = section.variant === "vertical" ? "vertical" : "horizontal";

  return (
    <SectionShell section={section}>
      <style>{STEPS_CSS}</style>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
      <ol className={`tf-st tf-st-${variant}`} style={{ "--st-n": items.length } as CSSProperties}>
        {items.map((it, i) => (
          <li key={i} className="tf-st-i" style={{ "--st-c": /^#[0-9a-f]{3,8}$/i.test(it.color ?? "") ? it.color : "var(--color-primary)" } as CSSProperties}>
            <span className="tf-st-dot" aria-hidden>{it.symbol?.trim() || i + 1}</span>
            <div className="tf-st-b">
              <h3 className="tf-st-t">{it.title}</h3>
              {it.text && <p className="tf-st-x">{it.text}</p>}
            </div>
          </li>
        ))}
      </ol>
      {props.cta?.text && props.cta.href && (
        <div className="tf-st-cta"><CtaButton link={props.cta} onDark={isDarkBg(section.style)} /></div>
      )}
    </SectionShell>
  );
}
