import type { SectionProps, Link as LinkT } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader, Card, CtaButton, GRID } from "./_shared";

interface Item {
  image?: string;
  icon?: string;
  title?: string;
  desc?: string;
  meta?: string;
  cta?: LinkT;
}
interface ServicesProps {
  label?: string;
  heading?: string;
  sub?: string;
  items?: Item[];
}

export default function Services({ section, props }: SectionProps<ServicesProps>) {
  const variant = section.variant ?? "cards-3";
  const items = props.items ?? [];

  // Nothing to show -> render nothing rather than an empty band.
  if (!items.length) return null;

  const cols = variant === "cards-2" ? GRID[2] : variant === "list" ? GRID[2] : GRID[3];
  const showImages = variant !== "list";

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />

      <div className={cols} style={{ textAlign: "left" }}>
        {items.map((it, i) => {
          const img = mediaUrl(it.image);
          return (
            <Card key={i}>
              {showImages && img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img}
                  alt={it.title ?? ""}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-5">
                <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                  {it.title}
                </h3>
                {it.meta && (
                  <p className="mt-1 text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
                    {it.meta}
                  </p>
                )}
                {it.desc && (
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    {it.desc}
                  </p>
                )}
                {it.cta?.text && (
                  <div className="mt-4">
                    <CtaButton link={{ ...it.cta, style: it.cta.style ?? "link" }} />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </SectionShell>
  );
}
