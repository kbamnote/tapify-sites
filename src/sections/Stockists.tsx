import type { CSSProperties } from "react";
import type { SectionProps } from "@/lib/types";
import { SectionShell, SectionHeader } from "./_shared";

interface StockistItem { city?: string; name?: string; address?: string; phone?: string; href?: string }
interface StockistsProps {
  label?: string; heading?: string; sub?: string;
  items?: StockistItem[];
  columns?: "2" | "3" | "4";
  showPhone?: boolean;
}

/**
 * Stockists — the shops that carry the brand, grouped by city.
 *
 * Mirrors SiteRenderer::secStockists; the two renderers must agree.
 *
 * Grouped rather than listed flat because this list is read by someone looking
 * for one city, not by someone reading forty shop names. The grouping comes
 * from the city field rather than from a nested repeater: nesting would mean
 * every new shop needs its city group created first, and a shop typed into the
 * wrong group is invisible to the person who added it.
 *
 * Cities keep the order they first appear in, so the customer controls the
 * sequence by ordering the list — their own city first, usually. Sorting
 * alphabetically here would silently override that.
 */

const CSS = `
.tf-stks{display:grid;grid-template-columns:repeat(var(--stk-cols,3),minmax(0,1fr));gap:30px 24px;text-align:left}
.tf-stk-city{margin:0 0 10px;font-size:13px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--color-primary)}
.tf-stk-group{border-top:2px solid var(--color-primary);padding-top:14px}
.tf-stk{padding:10px 0;border-bottom:1px solid var(--color-border)}
.tf-stk:last-child{border-bottom:0}
.tf-stk-n{display:block;font-size:15px;font-weight:700;line-height:1.35;color:var(--tf-heading,inherit);text-decoration:none}
a.tf-stk-n:hover{color:var(--color-primary)}
.tf-stk-a{display:block;margin-top:2px;font-size:13.5px;line-height:1.5;color:var(--tf-text,var(--color-muted))}
.tf-stk-p{display:inline-block;margin-top:4px;font-size:13.5px;color:var(--color-primary);text-decoration:none}
.tf-stk-p:hover{text-decoration:underline}
.tf-stks-cards .tf-stk-group{border-top:0;padding:20px;border-radius:var(--radius);background:var(--color-bg);border:1px solid var(--color-border)}
@media(max-width:900px){.tf-stks{grid-template-columns:repeat(2,minmax(0,1fr));gap:26px 16px}}
@media(max-width:560px){.tf-stks{grid-template-columns:1fr}}
`;

export default function Stockists({ section, props }: SectionProps<StockistsProps>) {
  const cards = section.variant === "cards";
  const cols = ["2", "3", "4"].includes(props.columns ?? "") ? props.columns : "3";
  const showPhone = props.showPhone !== false;

  // city -> rows, in the order the cities first appear.
  const byCity = new Map<string, StockistItem[]>();
  for (const it of props.items ?? []) {
    if (!it?.name?.trim()) continue;
    const city = it.city?.trim() || "Other";
    if (!byCity.has(city)) byCity.set(city, []);
    byCity.get(city)!.push(it);
  }
  if (!byCity.size) return null;

  return (
    <SectionShell section={section}>
      <style>{CSS}</style>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
      <div className={"tf-stks" + (cards ? " tf-stks-cards" : "")}
           style={{ "--stk-cols": cols } as CSSProperties}>
        {[...byCity].map(([city, rows]) => (
          <div className="tf-stk-group" key={city}>
            <h3 className="tf-stk-city">{city}</h3>
            {rows.map((it, i) => {
              // Only a real link becomes a link — a half-filled map field would
              // otherwise render an anchor that goes nowhere.
              const href = it.href?.trim();
              const linked = !!href && /^(https?:\/\/|\/)/i.test(href);
              return (
                <div className="tf-stk" key={i}>
                  {linked
                    ? <a className="tf-stk-n" href={href} target="_blank" rel="noopener noreferrer">{it.name}</a>
                    : <span className="tf-stk-n">{it.name}</span>}
                  {it.address?.trim() && <span className="tf-stk-a">{it.address}</span>}
                  {showPhone && it.phone?.trim() && (
                    <a className="tf-stk-p" href={"tel:" + it.phone.replace(/[^0-9+]/g, "")}>{it.phone}</a>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
