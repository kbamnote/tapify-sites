import type { SectionProps, Link as LinkT } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader, Card, CtaButton, GRID } from "./_shared";
import Carousel from "./Carousel";
import Marquee from "./Marquee";

interface Person {
  photo?: string;
  name?: string;
  role?: string;
  meta?: string;
  bio?: string;
  link?: LinkT;
}
interface TeamProps {
  label?: string;
  heading?: string;
  sub?: string;
  items?: Person[];
}

export default function Team({ section, props }: SectionProps<TeamProps>) {
  const variant = section.variant ?? "cards-3";
  const items = props.items ?? [];
  if (!items.length) return null;

  const isSlider = variant === "slider";
  const isMarquee = variant === "marquee";
  const round = variant === "circles";
  const cols = variant === "cards-4" ? GRID[4] : variant === "cards-2" ? GRID[2] : GRID[3];

  const cards = items.map((p, i) => {
    const img = mediaUrl(p.photo);
    return (
      <Card key={i} className="h-full p-6 text-center">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={p.name ?? ""}
            loading="lazy"
            className={round ? "mx-auto h-28 w-28 object-cover" : "mx-auto h-40 w-full object-cover"}
            style={{ borderRadius: round ? "999px" : "var(--radius)" }}
          />
        ) : (
          <div
            aria-hidden
            className="mx-auto flex h-28 w-28 items-center justify-center text-2xl font-bold"
            style={{ borderRadius: "999px", background: "var(--color-surface)", color: "var(--color-muted)" }}
          >
            {(p.name ?? "?").slice(0, 1)}
          </div>
        )}

        <h3 className="mt-4 text-base font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{p.name}</h3>
        {p.role && (
          <p className="mt-0.5 text-xs font-semibold" style={{ color: "var(--color-accent)" }}>{p.role}</p>
        )}
        {p.meta && (
          <p className="mt-2 inline-block px-3 py-1 text-xs"
             style={{ background: "var(--color-surface)", color: "var(--color-muted)", borderRadius: "999px" }}>
            {p.meta}
          </p>
        )}
        {p.bio && (
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>{p.bio}</p>
        )}
        {p.link?.text && (
          <div className="mt-3">
            <CtaButton link={{ ...p.link, style: p.link.style ?? "link" }} />
          </div>
        )}
      </Card>
    );
  });

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />

      {isMarquee ? <Marquee slides={cards} /> : isSlider ? <Carousel slides={cards} /> : <div className={cols}>{cards}</div>}
    </SectionShell>
  );
}
