import type { SectionProps, Link as LinkT } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, CtaButton, imageFitStyle, type Crop } from "./_shared";
import Carousel from "./Carousel";

interface Slide {
  image?: string;
  mobileImage?: string;
  badge?: string;
  heading?: string;
  sub?: string;
  cta?: LinkT;
  href?: string;
  panelColor?: string;
  imageFit?: string | Crop;
}
interface SlideshowProps {
  slides?: Slide[];
  height?: "short" | "medium" | "tall";
  autoplay?: string;
}

const HEIGHT: Record<string, number> = { short: 300, medium: 440, tall: 600 };

/** Same luma rule as SiteRenderer::readableOn, so the canvas shows the published text colour. */
function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const luma = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return luma > 0.6 ? "#111827" : "#FFFFFF";
}

/**
 * Banner slideshow — rotating full-width promo banners. Mirrors
 * SiteRenderer::secSlideshow: "split" puts the copy on a panel beside the photo,
 * "full" lays it over a shaded photo, "banner" shows designed pictures as they are.
 */
export default function Slideshow({ section, props, doc }: SectionProps<SlideshowProps>) {
  const variant = section.variant ?? "split";
  const slides = (props.slides ?? []).filter((s) => mediaUrl(s.image));
  if (!slides.length) return null;
  const h = HEIGHT[props.height ?? "medium"] ?? 440;
  const every = Number(props.autoplay ?? "5") || 0;

  const cards = slides.map((sl, i) => {
    const img = mediaUrl(sl.image) as string;
    const mob = mediaUrl(sl.mobileImage);
    const alt = sl.heading || doc.site.name;
    let pic = (
      <picture className="block h-full">
        {mob && <source media="(max-width:640px)" srcSet={mob} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={alt} className="h-full w-full" loading={i === 0 ? undefined : "lazy"} style={imageFitStyle(sl.imageFit)} />
      </picture>
    );
    if (sl.href) pic = <a href={sl.href} aria-label={alt} className="block h-full">{pic}</a>;

    const hasCopy = Boolean(sl.badge || sl.heading || sl.sub || (sl.cta?.text && sl.cta.href));
    const copy = (
      <div>
        {sl.badge && (
          <p className="mb-3.5 inline-block rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-[0.08em]" style={{ background: "var(--color-secondary)", color: "#121212" }}>
            {sl.badge}
          </p>
        )}
        {sl.heading && (
          <h2 className="text-[28px] leading-tight md:text-5xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 400 }}>{sl.heading}</h2>
        )}
        {sl.sub && <p className="mt-3.5 max-w-[470px] text-base leading-relaxed opacity-85">{sl.sub}</p>}
        {sl.cta?.text && sl.cta.href && (
          <div className="mt-6"><CtaButton link={sl.cta} onDark={variant === "full"} /></div>
        )}
      </div>
    );

    if (variant === "banner" || !hasCopy) {
      return <div key={i} className="relative">{pic}</div>;
    }
    if (variant === "full") {
      return (
        <div key={i} className="relative overflow-hidden text-left" style={{ height: h }}>
          {pic}
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(0,0,0,.6),rgba(0,0,0,.08) 72%)" }} />
          <div className="absolute inset-y-0 left-0 flex max-w-[720px] flex-col justify-center px-[8%] text-white">{copy}</div>
        </div>
      );
    }
    const panel = /^#[0-9a-f]{6}$/i.test(sl.panelColor ?? "") ? (sl.panelColor as string) : "";
    return (
      <div key={i} className="grid text-left md:grid-cols-[5fr_7fr]" style={{ minHeight: h, background: "var(--color-surface)" }}>
        <div
          className="order-2 flex items-center px-5 pb-12 pt-6 md:order-1 md:py-8 md:pl-[max(8%,72px)] md:pr-[6%]"
          style={panel ? { background: panel, color: readableOn(panel) } : { color: "var(--color-text)" }}
        >
          {copy}
        </div>
        <div className="order-1 h-60 overflow-hidden md:order-2 md:h-auto">{pic}</div>
      </div>
    );
  });

  return (
    <SectionShell section={section}>
      <div className="-mx-5 md:-mx-8">
        <Carousel slides={cards} autoplayMs={every * 1000} slideClassName="shrink-0 basis-full snap-start" gapClassName="gap-0" controlsInside />
      </div>
    </SectionShell>
  );
}
