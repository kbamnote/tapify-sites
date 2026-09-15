import type { CSSProperties, ReactNode } from "react";
import type { SectionProps } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader } from "./_shared";

interface CategoryItem { image?: string; title?: string; note?: string; href?: string }
interface CategoriesProps {
  label?: string;
  heading?: string;
  sub?: string;
  items?: CategoryItem[];
  columns?: string;
}

const COLS: Record<string, string> = {
  "3": "md:grid-cols-3", "4": "md:grid-cols-4", "5": "md:grid-cols-5", "6": "md:grid-cols-6", "8": "md:grid-cols-8",
};

/**
 * Shop by Category — mirrors SiteRenderer::secCategories. Tiles and circles are
 * one sideways-scrolling row on a phone; cards drop to two per row; pills wrap.
 */
export default function Categories({ section, props }: SectionProps<CategoriesProps>) {
  const variant = section.variant ?? "tiles";
  const items = (props.items ?? []).filter((it) => (it.title ?? "").trim() !== "");
  if (!items.length) return null;
  const cols = COLS[props.columns ?? "6"] ?? COLS["6"];

  const Wrap = ({ href, className, style, children }: { href?: string; className: string; style?: CSSProperties; children: ReactNode }) =>
    href ? (
      <a href={href} className={`${className} no-underline`} style={{ color: "inherit", ...style }}>{children}</a>
    ) : (
      <div className={className} style={style}>{children}</div>
    );

  const pic = (it: CategoryItem) => {
    const src = mediaUrl(it.image);
    return src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={it.title ?? ""} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
    ) : (
      <span aria-hidden className="flex h-full w-full items-center justify-center text-3xl" style={{ color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>
        {(it.title ?? "").slice(0, 1)}
      </span>
    );
  };

  let body: ReactNode;
  if (variant === "pills") {
    body = (
      <div className={`flex flex-wrap gap-2.5 ${section.style?.align === "left" ? "justify-start" : "justify-center"}`}>
        {items.map((it, i) => (
          <Wrap key={i} href={it.href} className="inline-flex items-center rounded-full px-5 py-2 text-sm" style={{ border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}>
            {it.title}
          </Wrap>
        ))}
      </div>
    );
  } else if (variant === "cards") {
    body = (
      <div className={`grid grid-cols-2 gap-3 md:gap-5 ${cols}`}>
        {items.map((it, i) => (
          <Wrap key={i} href={it.href} className="group relative block aspect-[3/4] overflow-hidden" style={{ borderRadius: "var(--radius)", background: "var(--color-surface)" }}>
            {pic(it)}
            <span className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 px-4 pb-4 pt-12 text-left text-white" style={{ background: "linear-gradient(to top,rgba(0,0,0,.72),transparent)" }}>
              <span className="text-lg">{it.title}</span>
              {it.note && <span className="text-xs opacity-90">{it.note}</span>}
            </span>
          </Wrap>
        ))}
      </div>
    );
  } else {
    const round = variant === "circles" ? "9999px" : "18px";
    body = (
      <div className={`flex gap-3.5 overflow-x-auto pb-1.5 [scrollbar-width:none] md:grid md:gap-5 md:overflow-visible ${cols}`}>
        {items.map((it, i) => (
          <Wrap key={i} href={it.href} className="group flex w-24 shrink-0 flex-col items-center gap-2.5 text-center md:w-auto">
            <span className="block aspect-square w-full overflow-hidden" style={{ borderRadius: round, background: "var(--color-surface)" }}>{pic(it)}</span>
            <span className="text-sm md:text-[17px]" style={{ color: "var(--tf-heading,inherit)" }}>{it.title}</span>
            {it.note && <span className="text-xs" style={{ color: "var(--tf-text,var(--color-muted))" }}>{it.note}</span>}
          </Wrap>
        ))}
      </div>
    );
  }

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
      {body}
    </SectionShell>
  );
}
