/**
 * Shared primitives every section is built from.
 *
 * SectionShell turns the document's `style` tokens (paddingY / align / bg /
 * overlay / radius) into real layout. Because every section goes through it,
 * spacing and backgrounds stay consistent across the whole site and a customer
 * cannot produce a broken-looking page.
 */

import type { CSSProperties, ReactNode } from "react";
import type { Link as LinkT, Section, SectionStyle } from "@/lib/types";
import { mediaUrl } from "@/lib/api";

const PAD: Record<NonNullable<SectionStyle["paddingY"]>, string> = {
  none: "0",
  sm: "calc(28px * var(--space-scale))",
  md: "calc(48px * var(--space-scale))",
  lg: "calc(72px * var(--space-scale))",
  xl: "calc(104px * var(--space-scale))",
};

const RADIUS: Record<NonNullable<SectionStyle["radius"]>, string> = {
  none: "0", sm: "6px", md: "12px", lg: "18px", xl: "26px",
};

function bgStyles(style: SectionStyle | undefined): CSSProperties {
  switch (style?.bg) {
    case "surface": return { background: "var(--color-surface)", color: "var(--color-text)" };
    case "primary": return { background: "var(--color-primary)", color: "var(--color-primary-fg)" };
    case "dark":    return { background: "#0F172A", color: "#F8FAFC" };
    case "image":   return { color: "#FFFFFF" };
    case "none":    return {};
    default:        return { background: "var(--color-bg)", color: "var(--color-text)" };
  }
}

export function SectionShell({
  section,
  children,
  className = "",
  backdrop,
}: {
  section: Section;
  children: ReactNode;
  className?: string;
  /** Full-bleed layer rendered behind the content (e.g. a hero background video). */
  backdrop?: ReactNode;
}) {
  const style = section.style ?? {};
  const padY = PAD[style.paddingY ?? "lg"];
  const bgImg = style.bg === "image" ? mediaUrl(style.bgMedia) : undefined;

  /**
   * "image" background implies white text. If the customer picked an image
   * background but hasn't chosen a photo yet, that would render white text on a
   * white page — the content would silently disappear. Fall back to the brand
   * colour so a section is never invisible.
   */
  const effective: SectionStyle = bgImg || style.bg !== "image" ? style : { ...style, bg: "primary" };
  const overlay = style.overlay ?? (bgImg ? 0.5 : 0);

  const align =
    style.align === "center" ? "center" : style.align === "right" ? "right" : "left";

  // Entrance animation (fade / slide-up / zoom). In the editor it plays on mount
  // so picking one previews it; the published PHP page reveals on scroll.
  const anim = style.animation && style.animation !== "none" ? `tf-anim-${style.animation}` : "";

  return (
    <section
      id={section.id}
      data-section-type={section.type}
      data-section-id={section.id}
      className={`relative w-full overflow-hidden ${anim} ${className}`}
      style={{
        paddingTop: padY,
        paddingBottom: padY,
        textAlign: align as CSSProperties["textAlign"],
        borderRadius: style.radius ? RADIUS[style.radius] : undefined,
        ...bgStyles(effective),
        // Per-section font colours, as custom properties so every heading and
        // paragraph inside picks them up — including the ones set inline.
        ...(style.headingColor ? { ["--tf-heading" as string]: style.headingColor } : {}),
        ...(style.textColor ? { ["--tf-text" as string]: style.textColor } : {}),
      }}
    >
      {bgImg && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImg})` }}
          />
          <div aria-hidden className="absolute inset-0" style={{ background: `rgba(2,6,23,${overlay})` }} />
        </>
      )}
      {backdrop}
      <div
        className="relative mx-auto px-5 md:px-8"
        style={{ maxWidth: "var(--container)" }}
      >
        {children}
      </div>
    </section>
  );
}

/** Eyebrow + heading + sub — the standard block at the top of most sections. */
export function SectionHeader({
  label,
  heading,
  sub,
  light = false,
}: {
  label?: string;
  heading?: string;
  sub?: string;
  light?: boolean;
}) {
  if (!label && !heading && !sub) return null;
  return (
    <div className="mb-10">
      {label && (
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-[0.14em]"
          style={{ color: light ? "var(--tf-text,rgba(255,255,255,.8))" : "var(--tf-text,var(--color-accent))" }}
        >
          {label}
        </p>
      )}
      {heading && (
        <h2
          className="text-3xl md:text-4xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--tf-heading,inherit)" }}
        >
          {heading}
        </h2>
      )}
      {sub && (
        <p
          className="mt-3 max-w-2xl text-base leading-relaxed"
          style={{
            color: light ? "var(--tf-text,rgba(255,255,255,.85))" : "var(--tf-text,var(--color-muted))",
            marginInline: "var(--header-mi, 0)",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/** True when a section's background is dark, so children must use light-on-dark treatments. */
export function isDarkBg(style: SectionStyle | undefined): boolean {
  return style?.bg === "primary" || style?.bg === "dark" || style?.bg === "image";
}

/**
 * Renders a `link` field. Returns null when the customer left it blank.
 *
 * `onDark` matters: a "primary" button is the brand colour, so on a primary/dark
 * hero it would be navy-on-navy and vanish. On dark backgrounds the primary CTA
 * switches to the accent colour so it always reads as a button.
 */
export function CtaButton({
  link,
  fallbackStyle = "primary",
  onDark = false,
}: {
  link?: LinkT;
  fallbackStyle?: LinkT["style"];
  onDark?: boolean;
}) {
  if (!link?.text || !link.href) return null;
  const variant = link.style ?? fallbackStyle ?? "primary";

  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5";

  const styles: Record<string, CSSProperties> = {
    primary: onDark
      ? { background: "var(--color-accent)", color: "var(--color-accent-fg)", borderRadius: "var(--radius)" }
      : { background: "var(--color-primary)", color: "var(--color-primary-fg)", borderRadius: "var(--radius)" },
    secondary: { background: "var(--color-accent)", color: "var(--color-accent-fg)", borderRadius: "var(--radius)" },
    ghost: onDark
      ? { background: "rgba(255,255,255,.14)", color: "#fff", border: "1px solid rgba(255,255,255,.45)", borderRadius: "var(--radius)" }
      : { background: "transparent", color: "var(--color-text)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)" },
    link: { color: onDark ? "#fff" : "var(--color-primary)", textDecoration: "underline", padding: 0 },
  };

  return (
    <a
      href={link.href}
      target={link.newTab ? "_blank" : undefined}
      rel={link.newTab ? "noopener noreferrer" : undefined}
      className={base}
      style={styles[variant]}
    >
      {link.text}
    </a>
  );
}

/** Card surface used by grid sections. */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`h-full overflow-hidden ${className}`}
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        boxShadow: "0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.06)",
      }}
    >
      {children}
    </div>
  );
}

export const GRID: Record<string, string> = {
  1: "grid grid-cols-1 gap-6",
  2: "grid grid-cols-1 sm:grid-cols-2 gap-6",
  3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
  4: "grid grid-cols-2 lg:grid-cols-4 gap-6",
};

/**
 * How a photo sits inside its frame — the section's visual crop.
 *
 * Mirrors imgFit() in SiteRenderer.php. The value is either a legacy string
 * ("cover"/"top"/"contain") from before the cropper existed, or {fit,x,y,zoom}
 * written by the builder's crop tool. Zoom needs a transform, which paints
 * outside the element box, so the paint is clipped back to that box.
 */
export type Crop = { fit?: "cover" | "contain"; x?: number; y?: number; zoom?: number };

export function imageFitStyle(fit?: string | Crop, radius = "0"): CSSProperties {
  if (typeof fit !== "object" || fit === null) {
    if (fit === "contain") return { objectFit: "contain", objectPosition: "center" };
    if (fit === "top") return { objectFit: "cover", objectPosition: "top" };
    return { objectFit: "cover", objectPosition: "center" };
  }
  if ((fit.fit ?? "cover") === "contain") return { objectFit: "contain", objectPosition: "center" };

  const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
  const x = clamp(Number(fit.x ?? 50), 0, 100);
  const y = clamp(Number(fit.y ?? 50), 0, 100);
  const z = clamp(Number(fit.zoom ?? 1), 1, 4);
  const base: CSSProperties = { objectFit: "cover", objectPosition: `${x}% ${y}%` };
  if (z <= 1.001) return base;
  return {
    ...base,
    transform: `scale(${z})`,
    transformOrigin: `${x}% ${y}%`,
    clipPath: radius === "0" ? "inset(0)" : `inset(0 round ${radius})`,
  };
}

