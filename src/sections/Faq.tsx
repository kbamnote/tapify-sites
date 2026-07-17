import type { SectionProps } from "@/lib/types";
import { SectionShell, SectionHeader } from "./_shared";

interface Item { q?: string; a?: string }
interface FaqProps {
  label?: string;
  heading?: string;
  sub?: string;
  items?: Item[];
  openFirst?: boolean;
}

/**
 * Uses native <details>/<summary> so the accordion works without any client
 * JavaScript — keeps the page a pure server component and fast.
 */
export default function Faq({ section, props }: SectionProps<FaqProps>) {
  const items = (props.items ?? []).filter((i) => i.q);
  if (!items.length) return null;

  const two = section.variant === "two-column";

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />

      <div className={two ? "grid grid-cols-1 gap-3 md:grid-cols-2" : "mx-auto max-w-3xl space-y-3"}>
        {items.map((it, i) => (
          <details
            key={i}
            open={props.openFirst !== false && i === 0}
            className="group"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              textAlign: "left",
            }}
          >
            <summary
              className="cursor-pointer list-none px-5 py-4 text-sm font-semibold marker:hidden"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="flex items-start justify-between gap-4">
                {it.q}
                <span aria-hidden className="shrink-0 transition-transform group-open:rotate-45" style={{ color: "var(--color-accent)" }}>
                  +
                </span>
              </span>
            </summary>
            {it.a && (
              <p className="whitespace-pre-line px-5 pb-4 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                {it.a}
              </p>
            )}
          </details>
        ))}
      </div>
    </SectionShell>
  );
}
