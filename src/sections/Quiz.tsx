"use client";

import { useState } from "react";
import type { SectionProps } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader } from "./_shared";
import { QUIZ_CSS } from "./advisorStyles";

interface Question { q?: string; tip?: string }
interface QuizProps {
  label?: string; heading?: string; sub?: string; image?: string;
  questions?: Question[];
  yesLabel?: string; noLabel?: string; unsureLabel?: string;
  goodTitle?: string; goodText?: string; midTitle?: string; midText?: string; lowTitle?: string; lowText?: string;
  ctaText?: string;
}

/** Self check-up quiz — mirrors SiteRenderer::secQuiz + quizScript(). */
export default function Quiz({ section, props, doc }: SectionProps<QuizProps>) {
  const qs = (props.questions ?? []).filter((q) => (q.q ?? "").trim());
  const [answers, setAnswers] = useState<Record<number, number>>({});
  if (!qs.length) return null;

  const opts: [number, string, string][] = [
    [2, props.yesLabel?.trim() || "Yes", "yes"],
    [0, props.noLabel?.trim() || "No", "no"],
    [1, props.unsureLabel?.trim() || "Not sure", "unsure"],
  ];
  const done = Object.keys(answers).length;
  const complete = done === qs.length;
  const pct = complete ? Math.round((Object.values(answers).reduce((a, b) => a + b, 0) / (2 * qs.length)) * 100) : 0;
  const band = pct >= 75 ? "good" : pct >= 40 ? "mid" : "low";
  const title = { good: props.goodTitle || "You are well prepared", mid: props.midTitle || "A good start, with some gaps", low: props.lowTitle || "Time to make a plan" }[band];
  const text = { good: props.goodText, mid: props.midText, low: props.lowText }[band];
  const gaps = qs.filter((q, i) => answers[i] !== undefined && answers[i] !== 2 && q.tip).map((q) => q.tip as string);
  const digits = String(doc.business?.whatsapp || doc.business?.phone || "").replace(/\D/g, "");
  const wa = digits.length === 10 ? `91${digits}` : digits;
  const lines = qs.map((q, i) => `${i + 1}. ${q.q} — ${opts.find((o) => o[0] === answers[i])?.[1] ?? ""}`).join("\n");
  const C = 2 * Math.PI * 44;

  const quiz = (
    <div className="tf-qz">
      <div className="tf-qz-bar">
        <span className="tf-qz-fill" style={{ width: `${(done / qs.length) * 100}%` }} />
        <em className="tf-qz-count">{done}/{qs.length}</em>
      </div>
      <ol className="tf-qz-list">
        {qs.map((q, i) => (
          <li key={i} className={`tf-qz-q ${answers[i] !== undefined ? "tf-qz-done" : ""}`}>
            <p className="tf-qz-qt"><span className="tf-qz-n">{i + 1}</span>{q.q}</p>
            <div className="tf-qz-opts" role="radiogroup">
              {opts.map(([v, l, k]) => (
                <label key={k} className={`tf-qz-opt tf-qz-${k}`}>
                  <input type="radio" name={`${section.id}-q${i}`} checked={answers[i] === v} onChange={() => setAnswers((a) => ({ ...a, [i]: v }))} />
                  <span>{l}</span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>
      {complete && (
        <div className="tf-qz-result" aria-live="polite">
          <div className={`tf-qz-score tf-qz-${band}`}>
            <svg viewBox="0 0 100 100" aria-hidden>
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="10" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${((pct / 100) * C).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 50 50)" />
            </svg>
            <strong>{pct}%</strong>
          </div>
          <div className="tf-qz-rtext">
            <h3>{title}</h3>
            {text && <p>{text}</p>}
            {!!gaps.length && <ul className="tf-qz-gaps">{gaps.map((g, i) => <li key={i}>{g}</li>)}</ul>}
            {wa && (
              <a className="tf-qz-cta" target="_blank" rel="noopener noreferrer"
                 href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi, I took the ${props.heading ?? "check-up"} on your website. My score: ${pct}%.\n\n${lines}\n\nPlease guide me.`)}`}>
                {props.ctaText?.trim() || "Discuss my result on WhatsApp"}
              </a>
            )}
            <button type="button" className="tf-qz-reset" onClick={() => setAnswers({})}>Start again</button>
          </div>
        </div>
      )}
    </div>
  );

  const img = mediaUrl(props.image);
  return (
    <SectionShell section={section}>
      <style>{QUIZ_CSS}</style>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
      {section.variant === "split" && img ? (
        <div className="tf-qz-split">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="tf-qz-img"><img src={img} alt="" loading="lazy" /></div>
          {quiz}
        </div>
      ) : (
        <div className="tf-qz-wrap">{quiz}</div>
      )}
    </SectionShell>
  );
}
