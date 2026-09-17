"use client";

import { useState, type CSSProperties } from "react";
import type { SectionProps } from "@/lib/types";
import { SectionShell, SectionHeader } from "./_shared";
import { CALC_CSS } from "./advisorStyles";

interface CalcItem { type?: string; title?: string; tag?: string; note?: string; returnRate?: number; color?: string }
interface CalculatorsProps {
  label?: string; heading?: string; sub?: string;
  items?: CalcItem[];
  showWhatsapp?: boolean; ctaText?: string; disclaimer?: string;
}

/* ---- maths: keep in step with SiteRenderer::calcScript() ---- */
type Field = [key: string, label: string, unit: string, min: number, max: number, step: number, def: number];
type Vals = Record<string, number>;
interface Result { big: [string, number][]; rows: [string, number | null, string?][]; donut?: [number, number]; dl?: [string, string]; msg: string }

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const short = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1e7) return "₹" + (n / 1e7).toFixed(2).replace(/\.?0+$/, "") + " Cr";
  if (a >= 1e5) return "₹" + (n / 1e5).toFixed(2).replace(/\.?0+$/, "") + " L";
  return inr(n);
};
const fvSip = (p: number, r: number, m: number) => { const i = r / 1200; return i ? p * ((Math.pow(1 + i, m) - 1) / i) * (1 + i) : p * m; };
const sipFor = (t: number, r: number, m: number) => { if (m <= 0) return t; const i = r / 1200; return i ? (t * i) / ((Math.pow(1 + i, m) - 1) * (1 + i)) : t / m; };

const SPEC: Record<string, { name: string; f: Field[]; run: (v: Vals) => Result }> = {
  sip: {
    name: "SIP Calculator",
    f: [["amt", "Monthly investment", "₹", 500, 200000, 500, 5000], ["rate", "Expected return (p.a.)", "%", 1, 30, 0.5, 12], ["yrs", "Time period", "yrs", 1, 40, 1, 15]],
    run: (v) => { const m = v.yrs * 12, inv = v.amt * m, fv = fvSip(v.amt, v.rate, m); return { big: [["Estimated future value", fv]], rows: [["Total invested", inv], ["Estimated returns", fv - inv]], donut: [inv, fv - inv], dl: ["Invested", "Returns"], msg: `SIP of ${inr(v.amt)}/month for ${v.yrs} years at ${v.rate}% ≈ ${short(fv)}` }; },
  },
  lumpsum: {
    name: "Lumpsum Calculator",
    f: [["amt", "One-time investment", "₹", 5000, 10000000, 5000, 100000], ["rate", "Expected return (p.a.)", "%", 1, 30, 0.5, 12], ["yrs", "Time period", "yrs", 1, 40, 1, 10]],
    run: (v) => { const fv = v.amt * Math.pow(1 + v.rate / 100, v.yrs); return { big: [["Estimated future value", fv]], rows: [["Invested", v.amt], ["Estimated returns", fv - v.amt]], donut: [v.amt, fv - v.amt], dl: ["Invested", "Returns"], msg: `Lumpsum of ${inr(v.amt)} for ${v.yrs} years at ${v.rate}% ≈ ${short(fv)}` }; },
  },
  goal: {
    name: "Goal Planner",
    f: [["cost", "Goal cost in today's money", "₹", 10000, 10000000, 10000, 1500000], ["yrs", "Years to the goal", "yrs", 1, 30, 1, 12], ["infl", "Cost inflation (p.a.)", "%", 0, 15, 0.5, 8], ["rate", "Expected return (p.a.)", "%", 1, 30, 0.5, 12]],
    run: (v) => { const fut = v.cost * Math.pow(1 + v.infl / 100, v.yrs), m = v.yrs * 12, sip = sipFor(fut, v.rate, m), lump = fut / Math.pow(1 + v.rate / 100, v.yrs); return { big: [["Monthly SIP needed", sip]], rows: [[`Goal cost after ${v.yrs} years`, fut], ["Or one-time investment today", lump], ["Total you will invest by SIP", sip * m]], msg: `A goal costing ${inr(v.cost)} today will need ≈ ${short(fut)} in ${v.yrs} years; SIP needed ≈ ${inr(sip)}/month` }; },
  },
  retirement: {
    name: "Retirement Planner",
    f: [["age", "Current age", "yrs", 18, 60, 1, 30], ["ret", "Retirement age", "yrs", 40, 75, 1, 60], ["exp", "Monthly expenses today", "₹", 5000, 500000, 1000, 30000], ["infl", "Inflation (p.a.)", "%", 0, 12, 0.5, 6], ["rate", "Return before retirement", "%", 1, 20, 0.5, 12], ["post", "Return after retirement", "%", 1, 15, 0.5, 7], ["life", "Plan till age", "yrs", 60, 100, 1, 85]],
    run: (v) => {
      const n = v.ret - v.age, yr = Math.max(v.life - v.ret, 1), exp = v.exp * Math.pow(1 + v.infl / 100, n), ann = exp * 12;
      const real = (1 + v.post / 100) / (1 + v.infl / 100) - 1;
      const corpus = Math.abs(real) < 1e-6 ? ann * yr : (ann * (1 - Math.pow(1 + real, -yr))) / real * (1 + real);
      const sip = sipFor(corpus, v.rate, n * 12);
      return { big: [["Retirement corpus needed", corpus], ["Monthly SIP to reach it", sip]], rows: [[`Monthly expenses at ${v.ret}`, exp], ["Years left to invest", null, `${n} years`], ["Years the corpus must last", null, `${yr} years`]], msg: `Retiring at ${v.ret} with ${inr(v.exp)}/month expenses today: corpus ≈ ${short(corpus)}, SIP ≈ ${inr(sip)}/month` };
    },
  },
  term: {
    name: "Term Insurance Cover",
    f: [["inc", "Annual income", "₹", 100000, 10000000, 25000, 800000], ["age", "Current age", "yrs", 18, 65, 1, 32], ["loans", "Outstanding loans", "₹", 0, 20000000, 50000, 0], ["cover", "Existing life cover", "₹", 0, 20000000, 50000, 0], ["sav", "Existing savings & investments", "₹", 0, 20000000, 50000, 0]],
    run: (v) => { const mult = Math.max(5, Math.min(20, 60 - v.age)), base = v.inc * mult, need = Math.max(base + v.loans - v.cover - v.sav, 0); return { big: [["Additional life cover to consider", need]], rows: [[`Income replacement (${mult}× annual income)`, base], ["Add: outstanding loans", v.loans], ["Less: existing cover and savings", v.cover + v.sav]], msg: `Annual income ${inr(v.inc)} at age ${v.age}: additional term cover to consider ≈ ${short(need)}` }; },
  },
  emi: {
    name: "EMI Calculator",
    f: [["amt", "Loan amount", "₹", 10000, 50000000, 10000, 1000000], ["rate", "Interest rate (p.a.)", "%", 1, 30, 0.1, 9], ["yrs", "Tenure", "yrs", 1, 30, 1, 10]],
    run: (v) => { const i = v.rate / 1200, m = v.yrs * 12, e = i ? (v.amt * i * Math.pow(1 + i, m)) / (Math.pow(1 + i, m) - 1) : v.amt / m, t = e * m; return { big: [["Monthly EMI", e]], rows: [["Principal", v.amt], ["Total interest", t - v.amt], ["Total payable", t]], donut: [v.amt, t - v.amt], dl: ["Principal", "Interest"], msg: `Loan of ${inr(v.amt)} at ${v.rate}% for ${v.yrs} years: EMI ≈ ${inr(e)}` }; },
  },
};

function Panel({ item, wa, cta, stacked }: { item: CalcItem; wa: string; cta: string; stacked: boolean }) {
  const spec = SPEC[item.type ?? ""];
  const [vals, setVals] = useState<Vals>(() =>
    Object.fromEntries((spec?.f ?? []).map((f) => [f[0], f[0] === "rate" && typeof item.returnRate === "number" ? item.returnRate : f[6]]))
  );
  if (!spec) return null;
  const title = item.title?.trim() || spec.name;
  const set = (k: string, f: Field, raw: string) => {
    const x = parseFloat(raw);
    if (Number.isNaN(x)) return;
    setVals((v) => ({ ...v, [k]: Math.max(f[3], Math.min(x, f[4] * 10)) }));
  };
  const invalid = item.type === "retirement" && vals.ret <= vals.age;
  const r = invalid ? null : spec.run(vals);
  const C = 2 * Math.PI * 42;

  return (
    <div className="tf-cx-panel" style={item.color ? ({ "--cx-c": item.color } as CSSProperties) : undefined}>
      {stacked && (
        <>
          {item.tag && <p className="tf-cx-tag">{item.tag}</p>}
          <h3 className="tf-cx-h">{title}</h3>
        </>
      )}
      {item.note && <p className="tf-cx-note">{item.note}</p>}
      <div className="tf-cx-body">
        <div className="tf-cx-inputs">
          {spec.f.map((f) => {
            const v = vals[f[0]];
            const pct = ((Math.min(v, f[4]) - f[3]) / (f[4] - f[3])) * 100;
            return (
              <div className="tf-cx-field" key={f[0]}>
                <div className="tf-cx-lab">
                  <label>{f[1]}</label>
                  <span className="tf-cx-num">
                    {f[2] === "₹" && <b>₹</b>}
                    <input type="number" inputMode="decimal" min={f[3]} step={f[5]} value={v} onChange={(e) => set(f[0], f, e.target.value)} />
                    {f[2] !== "₹" && <em>{f[2]}</em>}
                  </span>
                </div>
                <input
                  type="range" aria-label={f[1]} min={f[3]} max={f[4]} step={f[5]} value={Math.min(v, f[4])}
                  style={{ "--pct": `${pct}%` } as CSSProperties}
                  onChange={(e) => set(f[0], f, e.target.value)}
                />
              </div>
            );
          })}
        </div>
        <div className="tf-cx-out" aria-live="polite">
          {!r ? (
            <p className="tf-cx-warn">Retirement age should be more than your current age.</p>
          ) : (
            <>
              {r.big.map(([label, n]) => (
                <div className="tf-cx-big" key={label}><span>{label}</span><strong>{short(n)}</strong><small>{inr(n)}</small></div>
              ))}
              {r.donut && r.dl && (() => {
                const a = Math.max(r.donut[0], 0), b = Math.max(r.donut[1], 0), t = a + b || 1, pa = Math.round((a / t) * 100);
                return (
                  <div className="tf-cx-chart">
                    <svg viewBox="0 0 100 100" role="img" aria-label={`${r.dl[0]} ${pa}%, ${r.dl[1]} ${100 - pa}%`}>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--cx-soft)" strokeWidth="13" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--cx-c)" strokeWidth="13" strokeDasharray={`${((b / t) * C).toFixed(2)} ${C.toFixed(2)}`} transform="rotate(-90 50 50)" />
                      <text x="50" y="55" textAnchor="middle">{100 - pa}%</text>
                    </svg>
                    <ul><li><i className="tf-cx-k1" />{r.dl[0]} · {pa}%</li><li><i className="tf-cx-k2" />{r.dl[1]} · {100 - pa}%</li></ul>
                  </div>
                );
              })()}
              <ul className="tf-cx-rows">
                {r.rows.map(([label, n, text]) => (<li key={label}><span>{label}</span><b>{text ?? inr(n ?? 0)}</b></li>))}
              </ul>
              {wa && (
                <a className="tf-cx-cta" target="_blank" rel="noopener noreferrer"
                   href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi, I used the ${title} on your website. ${r.msg}. I would like to discuss a plan.`)}`}>
                  {cta}
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Financial calculators — mirrors SiteRenderer::secCalculators. */
export default function Calculators({ section, props, doc }: SectionProps<CalculatorsProps>) {
  const items = (props.items ?? []).filter((it) => it.type && SPEC[it.type]);
  const [active, setActive] = useState(0);
  if (!items.length) return null;
  const stacked = section.variant === "stacked";
  const tabbed = !stacked && items.length > 1;
  const digits = String(doc.business?.whatsapp || doc.business?.phone || "").replace(/\D/g, "");
  const wa = props.showWhatsapp === false ? "" : digits.length === 10 ? `91${digits}` : digits;
  const cta = props.ctaText?.trim() || "Discuss this plan on WhatsApp";
  const current = Math.min(active, items.length - 1);

  return (
    <SectionShell section={section}>
      <style>{CALC_CSS}</style>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
      <div className={`tf-cx tf-cx-${stacked ? "stacked" : "tabs"}`}>
        {tabbed && (
          <div className="tf-cx-tabs" role="tablist">
            {items.map((it, i) => (
              <button key={i} type="button" role="tab" className="tf-cx-tab" aria-selected={i === current}
                      style={it.color ? ({ "--cx-c": it.color } as CSSProperties) : undefined} onClick={() => setActive(i)}>
                {it.tag && <span className="tf-cx-tag">{it.tag}</span>}
                <span className="tf-cx-tabt">{it.title?.trim() || SPEC[it.type as string].name}</span>
              </button>
            ))}
          </div>
        )}
        {items.map((it, i) => (tabbed && i !== current ? null : <Panel key={`${i}-${it.type}`} item={it} wa={wa} cta={cta} stacked={!tabbed} />))}
        {props.disclaimer?.trim() && <p className="tf-cx-disc">{props.disclaimer}</p>}
      </div>
    </SectionShell>
  );
}
