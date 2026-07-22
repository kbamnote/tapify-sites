import type { SectionProps } from "@/lib/types";
import { SectionShell, SectionHeader, isDarkBg } from "./_shared";

interface HoursProps {
  label?: string;
  heading?: string;
  sub?: string;
  highlightToday?: boolean;
  note?: string;
}

const LABELS: Record<string, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
};
const ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const TODAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date().getDay()];

export default function BusinessHours({ section, props, doc }: SectionProps<HoursProps>) {
  const hours = doc.business?.hours ?? [];
  const byDay = new Map(hours.filter((h) => h.day).map((h) => [h.day, h]));
  const days = ORDER.filter((d) => byDay.has(d));
  const light = isDarkBg(section.style);

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} light={light} />
      {days.length ? (
        <ul className="mx-auto flex max-w-lg flex-col gap-2" style={{ listStyle: "none", padding: 0, textAlign: "left" }}>
          {days.map((d) => {
            const h = byDay.get(d)!;
            const isToday = props.highlightToday !== false && d === TODAY;
            const val = !h.closed && (h.open || h.close)
              ? [h.open, h.close].filter(Boolean).join(" – ")
              : "Closed";
            return (
              <li
                key={d}
                className="flex justify-between gap-4 px-4 py-3 text-[15px]"
                style={
                  isToday
                    ? { background: "var(--color-primary)", color: "var(--color-primary-fg)", fontWeight: 600, borderRadius: "var(--radius)" }
                    : { border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }
                }
              >
                <span>{LABELS[d]}{isToday ? " · Today" : ""}</span>
                <span>{val}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm opacity-60">Add your opening hours under Business Info.</p>
      )}
      {props.note && <p className="mt-4 text-[13px] opacity-70">{props.note}</p>}
    </SectionShell>
  );
}
