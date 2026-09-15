import type { SectionProps, Link as LinkT } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader, CtaButton, imageFitStyle, type Crop } from "./_shared";

interface Banner {
  image?: string;
  eyebrow?: string;
  heading?: string;
  sub?: string;
  cta?: LinkT;
  href?: string;
  imageFit?: string | Crop;
}
interface BannersProps {
  label?: string;
  heading?: string;
  sub?: string;
  items?: Banner[];
  shape?: "wide" | "landscape" | "square" | "portrait";
}

const RATIO: Record<string, string> = { wide: "3 / 2", landscape: "16 / 9", square: "1 / 1", portrait: "3 / 4" };

/** Promo banners — mirrors SiteRenderer::secBanners. */
export default function Banners({ section, props }: SectionProps<BannersProps>) {
  const variant = section.variant ?? "grid-2";
  const items = (props.items ?? []).filter((it) => mediaUrl(it.image));
  if (!items.length) return null;
  const shape = props.shape ?? "wide";
  const ratio = variant === "single" && shape === "wide" ? "3 / 1" : RATIO[shape] ?? "3 / 2";
  const cols = variant === "single" ? "md:grid-cols-1" : variant === "grid-3" ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
      <div className={`grid grid-cols-1 gap-3.5 md:gap-5 ${cols}`}>
        {items.map((it, i) => {
          const href = it.href || it.cta?.href || "";
          const hasCopy = Boolean(it.eyebrow || it.heading || it.sub || (it.cta?.text && it.cta.href));
          return (
            <div key={i} className="group relative overflow-hidden" style={{ aspectRatio: ratio, borderRadius: "var(--radius)", background: "var(--color-surface)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(it.image) as string} alt={it.heading ?? ""} loading="lazy" className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-[1.04]" style={imageFitStyle(it.imageFit)} />
              {href && <a href={href} aria-label={it.heading || "Open"} className="absolute inset-0 z-[1]" />}
              {hasCopy && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] px-6 pb-5 pt-16 text-left text-white" style={{ background: "linear-gradient(to top,rgba(0,0,0,.68),transparent)" }}>
                  {it.eyebrow && <p className="mb-1.5 text-xs uppercase tracking-[0.12em] opacity-90">{it.eyebrow}</p>}
                  {it.heading && <h3 className="text-xl md:text-[26px]" style={{ fontFamily: "var(--font-heading)", fontWeight: 400 }}>{it.heading}</h3>}
                  {it.sub && <p className="mt-1.5 text-sm opacity-90">{it.sub}</p>}
                  {it.cta?.text && it.cta.href && (
                    <div className="pointer-events-auto mt-3.5"><CtaButton link={it.cta} onDark /></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
