"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import type { SectionProps, Link as LinkT } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader } from "./_shared";
import { PILLARS_CSS } from "./advisorStyles";

interface Pillar {
  symbol?: string; name?: string; title?: string; subtitle?: string; tagline?: string;
  text?: string; focus?: string[]; image?: string; color?: string; cta?: LinkT;
}
interface PillarsProps { label?: string; heading?: string; sub?: string; items?: Pillar[] }

const colorVar = (c?: string) => ({ "--px-c": /^#[0-9a-f]{3,8}$/i.test(c ?? "") ? c : "var(--color-primary)" }) as CSSProperties;

function Detail({ it }: { it: Pillar }): ReactNode {
  const chips = (it.focus ?? []).filter((f) => f && f.trim());
  return (
    <>
      {it.subtitle && <p className="tf-px-sub">{it.subtitle}</p>}
      <h3 className="tf-px-title">{it.title}</h3>
      {it.tagline && <p className="tf-px-tagline">{it.tagline}</p>}
      {it.text && <p className="tf-px-text">{it.text}</p>}
      {!!chips.length && <ul className="tf-px-chips">{chips.map((c, i) => <li key={i}>{c}</li>)}</ul>}
      {it.cta?.text && it.cta.href && (
        <a className="tf-px-cta" href={it.cta.href}>{it.cta.text} <span aria-hidden>→</span></a>
      )}
    </>
  );
}

/** Pillars — mirrors SiteRenderer::secPillars ("tabs" uses radios there; state here). */
export default function Pillars({ section, props }: SectionProps<PillarsProps>) {
  const items = (props.items ?? []).filter((it) => (it.title ?? "").trim());
  const [on, setOn] = useState(0);
  if (!items.length) return null;

  if (section.variant === "cards") {
    return (
      <SectionShell section={section}>
        <style>{PILLARS_CSS}</style>
        <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
        <div className="tf-px-cards" style={{ "--px-n": Math.min(items.length, 5) } as CSSProperties}>
          {items.map((it, i) => {
            const img = mediaUrl(it.image);
            const badge = <span className="tf-px-badge"><span aria-hidden>{it.symbol}</span> {it.name}</span>;
            return (
              <article key={i} className="tf-px-card" style={colorVar(it.color)}>
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <div className="tf-px-img"><img src={img} alt={it.title} loading="lazy" />{badge}</div>
                ) : (
                  <div className="tf-px-top">{badge}</div>
                )}
                <div className="tf-px-cbody"><Detail it={it} /></div>
              </article>
            );
          })}
        </div>
      </SectionShell>
    );
  }

  const current = Math.min(on, items.length - 1);
  return (
    <SectionShell section={section}>
      <style>{PILLARS_CSS}</style>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
      <div className="tf-px">
        <div className="tf-px-nav" role="tablist" style={{ "--px-n": items.length } as CSSProperties}>
          {items.map((it, i) => (
            <button key={i} type="button" role="tab" aria-selected={i === current}
                    className={`tf-px-pick ${i === current ? "is-on" : ""}`} style={colorVar(it.color)} onClick={() => setOn(i)}>
              <span className="tf-px-orb" aria-hidden>{it.symbol}</span>
              <span className="tf-px-pname">{it.name}</span>
              <span className="tf-px-ptitle">{it.title}</span>
            </button>
          ))}
        </div>
        {items.map((it, i) => {
          const img = mediaUrl(it.image);
          return (
            <div key={i} className={`tf-px-panel ${i === current ? "is-on" : ""} ${img ? "" : "no-img"}`} style={colorVar(it.color)}>
              {img && (
                <div className="tf-px-pimg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={it.title} loading="lazy" />
                  <span className="tf-px-bigsym" aria-hidden>{it.symbol}</span>
                </div>
              )}
              <div className="tf-px-pbody">
                {it.name && <p className="tf-px-kicker">{it.name}</p>}
                <Detail it={it} />
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
