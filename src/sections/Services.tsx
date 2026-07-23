import type { SectionProps, Link as LinkT } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader, Card, CtaButton, GRID, imageFitStyle , type Crop} from "./_shared";
import Carousel from "./Carousel";
import Marquee from "./Marquee";

interface GalleryPhoto { image?: string; alt?: string }
interface Item {
  image?: string;
  icon?: string;
  title?: string;
  desc?: string;
  meta?: string;
  cta?: LinkT;
  body?: string;
  gallery?: GalleryPhoto[];
  price?: string;
  slug?: string;
}
interface ServicesProps {
  label?: string;
  heading?: string;
  sub?: string;
  items?: Item[];
  imageFit?: string | Crop;
}

/** URL-safe slug for an item: its slug field, else built from the title. */
function itemSlug(it: Item): string {
  const s = (it.slug || it.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s || "service";
}

export default function Services({ section, props }: SectionProps<ServicesProps>) {
  const variant = section.variant ?? "cards-3";
  const items = props.items ?? [];

  // Nothing to show -> render nothing rather than an empty band.
  if (!items.length) return null;

  const isCarousel = variant === "carousel";
  const isMarquee = variant === "marquee";
  const cols =
    variant === "cards-2" || variant === "list" ? GRID[2] : variant === "cards-4" ? GRID[4] : GRID[3];
  const showImages = variant !== "list";

  const cards = items.map((it, i) => {
    const img = mediaUrl(it.image);
    return (
      <Card key={i} className="h-full">
        {showImages && img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={it.title ?? ""} className="h-44 w-full" loading="lazy" style={imageFitStyle(props.imageFit)} />
        )}
        <div className="p-5">
          <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            {it.title}
          </h3>
          {it.meta && (
            <p className="mt-1 text-xs font-semibold" style={{ color: "var(--color-accent)" }}>{it.meta}</p>
          )}
          {it.price && (
            <p className="mt-1.5 text-base font-bold" style={{ color: "var(--color-primary)" }}>{it.price}</p>
          )}
          {it.desc && (
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--tf-text,var(--color-muted))" }}>{it.desc}</p>
          )}
          {/* A service with a full description opens its own product-style page
              (photo gallery + details) — that takes priority over a plain button. */}
          {it.body?.trim() ? (
            <div className="mt-4">
              <CtaButton link={{ text: "View details", href: `/service/${itemSlug(it)}`, style: "link" }} />
            </div>
          ) : (
            it.cta?.text && (
              <div className="mt-4">
                <CtaButton link={{ ...it.cta, style: it.cta.style ?? "link" }} />
              </div>
            )
          )}
        </div>
      </Card>
    );
  });

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />

      {isMarquee ? (
        <Marquee slides={cards} />
      ) : isCarousel ? (
        <Carousel slides={cards} />
      ) : (
        <div className={cols} style={{ textAlign: "left" }}>{cards}</div>
      )}
    </SectionShell>
  );
}
