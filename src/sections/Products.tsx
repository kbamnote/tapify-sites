import type { ReactNode } from "react";
import type { SectionProps, Link as LinkT } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader, Card, CtaButton, GRID, imageFitStyle, type Crop } from "./_shared";
import Carousel from "./Carousel";
import Marquee from "./Marquee";

interface GalleryPhoto { image?: string; alt?: string }
interface AttributeOption { value?: string; swatch?: string; image?: string }
interface Attribute { name?: string; options?: AttributeOption[] }
interface Variant { option1?: string; option2?: string; option3?: string; sku?: string; price?: string; mrp?: string; stock?: number; image?: string }
interface Item {
  image?: string;
  title?: string;
  desc?: string;
  meta?: string;
  cta?: LinkT;
  body?: string;
  gallery?: GalleryPhoto[];
  price?: string;
  mrp?: string;
  attributes?: Attribute[];
  variants?: Variant[];
  slug?: string;
}
interface ProductsProps {
  label?: string;
  heading?: string;
  sub?: string;
  items?: Item[];
  imageFit?: string | Crop;
}

/** URL-safe slug for an item: its slug field, else built from the title. */
function itemSlug(it: Item): string {
  const s = (it.slug || it.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s || "product";
}

/** Selling price, MRP and the discount label — mirrors SiteRenderer::priceBits(). */
function priceBits(it: Item): [string, string, string] {
  const sell = (it.price || "").trim();
  const mrp = (it.mrp || "").trim();
  let off = "";
  if (sell && mrp) {
    const ns = parseFloat(sell.replace(/[^0-9.]/g, "")) || 0;
    const nm = parseFloat(mrp.replace(/[^0-9.]/g, "")) || 0;
    if (nm > 0 && ns > 0 && ns < nm) off = `${Math.round(((nm - ns) / nm) * 100)}% Off`;
  }
  return [sell, mrp, off];
}

export default function Products({ section, props }: SectionProps<ProductsProps>) {
  const variant = section.variant ?? "cards-3";
  const items = props.items ?? [];

  // Nothing to show -> render nothing rather than an empty band.
  if (!items.length) return null;

  const isCarousel = variant === "carousel";
  const isMarquee = variant === "marquee";
  const cols =
    variant === "cards-2" || variant === "list" ? GRID[2] : variant === "cards-4" ? GRID[4] : GRID[3];
  const showImages = variant !== "list";

  const Open = ({ href, children }: { href: string; children: ReactNode }) =>
    href ? (
      <a href={href} className="block no-underline" style={{ color: "inherit" }}>{children}</a>
    ) : (
      <>{children}</>
    );

  const cards = items.map((it, i) => {
    const img = mediaUrl(it.image);
    // An item with a full description has its own product page. The photo and
    // the title link straight to it — a separate button is one extra thing to
    // notice for something the card already implies.
    const href = it.body?.trim() ? `/product/${itemSlug(it)}` : "";
    const [sell, mrp, off] = priceBits(it);
    return (
      <Card key={i} className="h-full">
        {showImages && img && (
          <Open href={href}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={it.title ?? ""} className="h-44 w-full" loading="lazy" style={imageFitStyle(props.imageFit)} />
          </Open>
        )}
        <div className="p-5">
          <Open href={href}>
            <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
              {it.title}
            </h3>
          </Open>
          {it.meta && (
            <p className="mt-1 text-xs font-semibold" style={{ color: "var(--color-accent)" }}>{it.meta}</p>
          )}
          {(sell || mrp) && (
            <p className="mt-1.5 flex flex-wrap items-baseline gap-2">
              {sell && (
                <span className="text-base font-bold" style={{ color: "var(--color-primary)" }}>{sell}</span>
              )}
              {mrp && (
                <s className="text-xs" style={{ color: "var(--tf-text,var(--color-muted))" }}>{mrp}</s>
              )}
              {off && <span className="text-xs font-bold text-green-600">{off}</span>}
            </p>
          )}
          {it.desc && (
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--tf-text,var(--color-muted))" }}>{it.desc}</p>
          )}
          {/* Items without a description have no page to open, so they keep
              whatever custom button was configured. */}
          {!href && it.cta?.text && (
            <div className="mt-4">
              <CtaButton link={{ ...it.cta, style: it.cta.style ?? "link" }} />
            </div>
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
