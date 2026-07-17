import type { SectionProps } from "@/lib/types";
import { SectionShell, SectionHeader } from "./_shared";

interface Item { icon?: string; value?: number; suffix?: string; label?: string }
interface StatsProps {
  label?: string;
  heading?: string;
  sub?: string;
  items?: Item[];
  countUp?: boolean;
}

export default function Stats({ section, props }: SectionProps<StatsProps>) {
  const items = props.items ?? [];
  if (!items.length) return null;

  const onDark = section.style?.bg === "primary" || section.style?.bg === "dark" || section.style?.bg === "image";
  const cols = items.length >= 4 ? "sm:grid-cols-4" : items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} light={onDark} />

      <div className={`grid grid-cols-2 gap-6 ${cols}`}>
        {items.map((it, i) => (
          <div key={i} className="text-center">
            <div
              className="text-3xl md:text-4xl font-bold tabular-nums"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {(it.value ?? 0).toLocaleString("en-IN")}
              <span style={{ color: onDark ? "inherit" : "var(--color-accent)" }}>{it.suffix}</span>
            </div>
            <p className="mt-1 text-sm" style={{ opacity: onDark ? 0.85 : 1, color: onDark ? "inherit" : "var(--color-muted)" }}>
              {it.label}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
