import type { SectionProps, Link as LinkT } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, CtaButton, isDarkBg } from "./_shared";

interface HeroProps {
  badge?: string;
  heading?: string;
  sub?: string;
  image?: string;
  ctaPrimary?: LinkT;
  ctaSecondary?: LinkT;
  showWhatsapp?: boolean;
  showCall?: boolean;
}

export default function Hero({ section, props, doc }: SectionProps<HeroProps>) {
  const variant = section.variant ?? "centered-bg";
  const img = mediaUrl(props.image);
  const biz = doc.business ?? {};

  // "Centered on background image": the Image field IS the section background.
  // The document keeps the picture in props.image, so feed it into the shell as
  // the background rather than expecting a separate Style → Background image.
  const heroSection =
    variant === "centered-bg" && props.image
      ? { ...section, style: { ...(section.style ?? {}), bg: "image" as const, bgMedia: props.image, overlay: section.style?.overlay ?? 0.55 } }
      : section;
  const onDark = isDarkBg(heroSection.style);

  const heading = (
    <h1
      className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1]"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {props.heading}
    </h1>
  );

  const body = (
    <>
      {props.badge && (
        <span
          className="mb-5 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
          style={{
            background: "var(--color-accent)",
            color: "var(--color-accent-fg)",
            borderRadius: "999px",
          }}
        >
          {props.badge}
        </span>
      )}
      {heading}
      {props.sub && (
        <p className="mt-4 max-w-2xl text-base md:text-lg leading-relaxed opacity-90">{props.sub}</p>
      )}

      <div className="mt-8 flex flex-wrap gap-3" style={{ justifyContent: "inherit" }}>
        <CtaButton link={props.ctaPrimary} onDark={onDark} />
        <CtaButton link={props.ctaSecondary} fallbackStyle="ghost" onDark={onDark} />
        {props.showWhatsapp && biz.whatsapp && (
          <CtaButton
            onDark={onDark}
            link={{ text: "WhatsApp", href: `https://wa.me/${biz.whatsapp.replace(/\D/g, "")}`, newTab: true, style: "ghost" }}
          />
        )}
        {props.showCall && biz.phone && (
          <CtaButton onDark={onDark} link={{ text: "Call now", href: `tel:${biz.phone}`, style: "ghost" }} />
        )}
      </div>
    </>
  );

  // Split: text one side, image the other.
  if (variant === "split" && img) {
    return (
      <SectionShell section={section}>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2" style={{ textAlign: "left" }}>
          <div>{body}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt={props.heading ?? doc.site.name}
            className="w-full object-cover"
            style={{ borderRadius: "var(--radius)", maxHeight: 460 }}
          />
        </div>
      </SectionShell>
    );
  }

  // centered-bg / minimal — the background image is handled by SectionShell.
  return (
    <SectionShell section={heroSection}>
      <div className="mx-auto flex max-w-3xl flex-col" style={{ alignItems: "inherit" }}>
        {body}
      </div>
    </SectionShell>
  );
}
