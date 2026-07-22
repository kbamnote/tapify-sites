import type { SectionProps } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader, Card, GRID } from "./_shared";
import Carousel from "./Carousel";
import Marquee from "./Marquee";

interface Review {
  quote?: string;
  name?: string;
  role?: string;
  photo?: string;
  rating?: number;
}
interface TestimonialsProps {
  label?: string;
  heading?: string;
  sub?: string;
  items?: Review[];
  autoplay?: boolean;
}

function Stars({ n = 5 }: { n?: number }) {
  const full = Math.max(0, Math.min(5, Math.round(n)));
  return (
    <div aria-label={`${full} out of 5`} className="text-sm" style={{ color: "var(--color-accent)" }}>
      {"★".repeat(full)}
      <span style={{ opacity: 0.25 }}>{"★".repeat(5 - full)}</span>
    </div>
  );
}

export default function Testimonials({ section, props }: SectionProps<TestimonialsProps>) {
  const variant = section.variant ?? "cards-3";
  const items = props.items ?? [];
  if (!items.length) return null;

  if (variant === "single") {
    const r = items[0];
    return (
      <SectionShell section={section}>
        <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
        <figure className="mx-auto max-w-3xl">
          <blockquote className="text-xl md:text-2xl leading-relaxed" style={{ fontFamily: "var(--font-heading)" }}>
            “{r.quote}”
          </blockquote>
          <figcaption className="mt-5 flex items-center justify-center gap-3">
            {mediaUrl(r.photo) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(r.photo)} alt={r.name ?? ""} className="h-11 w-11 rounded-full object-cover" loading="lazy" />
            )}
            <span>
              <span className="block text-sm font-semibold">{r.name}</span>
              {r.role && <span className="block text-xs" style={{ color: "var(--color-muted)" }}>{r.role}</span>}
            </span>
          </figcaption>
        </figure>
      </SectionShell>
    );
  }

  const cards = items.map((r, i) => (
    <Card key={i} className="h-full p-6 text-left">
      <Stars n={r.rating ?? 5} />
      <blockquote className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
        “{r.quote}”
      </blockquote>
      <div className="mt-5 flex items-center gap-3">
        {mediaUrl(r.photo) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(r.photo)} alt={r.name ?? ""} className="h-10 w-10 rounded-full object-cover" loading="lazy" />
        )}
        <div>
          <p className="text-sm font-semibold">{r.name}</p>
          {r.role && <p className="text-xs" style={{ color: "var(--color-muted)" }}>{r.role}</p>}
        </div>
      </div>
    </Card>
  ));

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />

      {variant === "marquee" ? (
        <Marquee slides={cards} />
      ) : variant === "slider" ? (
        <Carousel slides={cards} autoplayMs={props.autoplay === false ? 0 : 4000} />
      ) : (
        <div className={GRID[3]}>{cards}</div>
      )}
    </SectionShell>
  );
}
