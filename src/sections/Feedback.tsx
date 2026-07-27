/**
 * Feedback — a satisfaction form. Two variants:
 *  - "stars": a star rating + message
 *  - "survey": a customisable grid (rows × rating columns) + comment
 * Static preview for the builder canvas; the live interactivity is in the PHP
 * renderer's secFeedback.
 */
import type { CSSProperties } from "react";
import type { SectionProps } from "@/lib/types";
import { SectionShell, SectionHeader } from "./_shared";

interface FeedbackProps {
  label?: string;
  heading?: string;
  sub?: string;
  showRating?: boolean;
  showEmail?: boolean;
  submitText?: string;
  rows?: string[];
  columns?: string[];
  commentLabel?: string;
}

const input: CSSProperties = {
  width: "100%", padding: "10px 12px", fontSize: 14, marginBottom: 10,
  border: "1px solid var(--color-border)", borderRadius: "var(--radius)",
  background: "var(--color-bg)", color: "var(--color-text)",
};
const btn: CSSProperties = {
  width: "100%", padding: 12, fontSize: 15, fontWeight: 700, border: "none",
  borderRadius: "var(--radius)", background: "var(--color-primary)", color: "var(--color-primary-fg)",
};

export default function Feedback({ section, props }: SectionProps<FeedbackProps>) {
  const isSurvey = section.variant === "survey";

  const body = isSurvey ? (() => {
    const rows = (props.rows ?? []).filter(Boolean);
    const cols = (props.columns ?? []).filter(Boolean);
    const finalRows = rows.length ? rows : ["Overall Experience"];
    const finalCols = cols.length ? cols : ["Amazing", "Good", "Decent", "Disappointing"];
    return (
      <div style={{ maxWidth: 660, margin: "0 auto", textAlign: "left" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: 8 }} />
                {finalCols.map((c, i) => (
                  <th key={i} style={{ padding: "8px 10px", fontSize: 13, fontWeight: 700, color: "var(--color-primary)", textAlign: "center" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {finalRows.map((rw, ri) => (
                <tr key={ri} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "10px 8px", fontSize: 14, color: "var(--color-text)" }}>{rw}</td>
                  {finalCols.map((_, ci) => (
                    <td key={ci} style={{ textAlign: "center", padding: "10px 8px" }}>
                      <input type="radio" disabled style={{ width: 18, height: 18 }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <label style={{ display: "block", margin: "16px 0 6px", fontSize: 14, fontWeight: 600 }}>
          {props.commentLabel || "Any comments, questions or suggestions?"}
        </label>
        <textarea rows={4} disabled style={{ ...input, resize: "none" }} />
        <button type="button" style={btn}>{props.submitText || "Send feedback"}</button>
      </div>
    );
  })() : (
    <div style={{ maxWidth: 460, margin: "0 auto", textAlign: "left", padding: 24, background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", boxShadow: "0 8px 30px rgba(16,24,40,.06)" }}>
      {props.showRating !== false && (
        <div style={{ fontSize: 30, color: "#f59e0b", letterSpacing: 5, marginBottom: 12, textAlign: "center" }}>★★★★★</div>
      )}
      <input placeholder="Your name" style={input} disabled />
      {props.showEmail !== false && <input placeholder="Email (optional)" style={input} disabled />}
      <textarea placeholder="Your feedback…" rows={4} style={{ ...input, resize: "none" }} disabled />
      <button type="button" style={btn}>{props.submitText || "Send feedback"}</button>
    </div>
  );

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
      {body}
    </SectionShell>
  );
}
