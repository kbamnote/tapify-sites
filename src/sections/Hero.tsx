"use client";

import { useEffect, useRef } from "react";
import type { SectionProps, Link as LinkT } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, CtaButton, isDarkBg, imageFitStyle, type Crop } from "./_shared";

interface HeroProps {
  badge?: string;
  heading?: string;
  sub?: string;
  image?: string;
  imageFit?: string | Crop;
  video?: string;
  videoUrl?: string;
  fullHeight?: boolean;
  ctaPrimary?: LinkT;
  ctaSecondary?: LinkT;
  showWhatsapp?: boolean;
  showCall?: boolean;
}

/** YouTube / Vimeo id -> embeddable, autoplaying, muted, looping URL. */
function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}&controls=0&playsinline=1`;
  const vm = url.match(/vimeo\.com\/(\d+)/i);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1&muted=1&loop=1&background=1`;
  return null;
}

export default function Hero({ section, props, doc }: SectionProps<HeroProps>) {
  const variant = section.variant ?? "centered-bg";
  const img = mediaUrl(props.image);
  const biz = doc.business ?? {};

  // Video takes priority over the image: an uploaded file, else a pasted link
  // (direct .mp4 plays inline; YouTube/Vimeo render as an embed).
  const uploaded = mediaUrl(props.video);
  const linked = (props.videoUrl ?? "").trim();
  const embed = !uploaded && linked ? embedUrl(linked) : null;
  const fileVideo = uploaded || (linked && !embed ? linked : null);
  const hasVideo = !!(fileVideo || embed);

  // <iframe> content isn't a replaced element, so object-fit doesn't work on it.
  // This measures the ACTUAL backdrop box (any height — not just a full-viewport
  // hero) and sizes the embed in pixels to cover it, keyed to 16:9. Fixes the old
  // width:177.78vh hack, which sized off the viewport instead of the section and
  // broke badly on phones (short/non-fullHeight heroes, dynamic browser-chrome vh).
  const embedRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const frame = embedRef.current;
    const wrap = frame?.parentElement;
    if (!frame || !wrap) return;
    const ar = 16 / 9;
    const fit = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      const [fw, fh] = w / h > ar ? [w * 1.1, (w * 1.1) / ar] : [h * 1.1 * ar, h * 1.1];
      frame.style.width = `${fw}px`;
      frame.style.height = `${fh}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    ro?.observe(wrap);
    return () => {
      window.removeEventListener("resize", fit);
      ro?.disconnect();
    };
  }, [embed, fileVideo, variant]);

  /** The video layer used as a hero background (behind the copy). */
  const videoBg = hasVideo ? (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {fileVideo ? (
        <video src={fileVideo} autoPlay muted loop playsInline className="h-full w-full object-cover" />
      ) : (
        <iframe
          ref={embedRef}
          src={embed!}
          allow="autoplay; encrypted-media; picture-in-picture"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
          title={props.heading ?? doc.site.name}
        />
      )}
      <div className="absolute inset-0" style={{ background: `rgba(2,6,23,${section.style?.overlay ?? 0.55})` }} />
    </div>
  ) : null;

  // "Centered on background image": the Image field IS the section background.
  // The document keeps the picture in props.image, so feed it into the shell as
  // the background rather than expecting a separate Style → Background image.
  const heroSection =
    hasVideo && variant !== "split"
      ? // A video backdrop is dark, so force light-on-dark treatment.
        { ...section, style: { ...(section.style ?? {}), bg: "dark" as const } }
      : variant === "centered-bg" && props.image
        ? { ...section, style: { ...(section.style ?? {}), bg: "image" as const, bgMedia: props.image, bgFit: props.imageFit, overlay: section.style?.overlay ?? 0.55 } }
        : section;
  const onDark = isDarkBg(heroSection.style);

  // Full-viewport hero, like a landing page. The .tf-full rule in globals.css
  // owns the height so the mobile breakpoint can shorten it (min-h-dvh here
  // would be a fixed utility the breakpoint could not walk back).
  const fullClass = props.fullHeight ? "tf-full" : "";

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

      {/* Buttons go full-width and stack on phones — side-by-side CTAs get
          squeezed to a few characters at 360px. */}
      <div
        className="mt-6 flex flex-wrap gap-2.5 max-sm:[&>a:not(.tf-btn-link)]:flex-[1_1_100%] sm:mt-8 sm:gap-3"
        style={{ justifyContent: "inherit" }}
      >
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

  // Split: text one side, video/image the other.
  if (variant === "split" && (hasVideo || img)) {
    return (
      <SectionShell section={section} className={fullClass}>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2" style={{ textAlign: "left" }}>
          <div>{body}</div>
          {hasVideo ? (
            <div className="w-full overflow-hidden" style={{ borderRadius: "var(--radius)", aspectRatio: "16 / 9" }}>
              {fileVideo ? (
                <video src={fileVideo} autoPlay muted loop playsInline controls className="h-full w-full object-cover" />
              ) : (
                <iframe src={embed!} allow="autoplay; encrypted-media; picture-in-picture" className="h-full w-full border-0" title={props.heading ?? doc.site.name} />
              )}
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img!}
              alt={props.heading ?? doc.site.name}
              className="w-full"
              style={{ borderRadius: "var(--radius)", maxHeight: 460,
                       ...imageFitStyle(props.imageFit, "var(--radius)") }}
            />
          )}
        </div>
      </SectionShell>
    );
  }

  // centered-bg / minimal — a video backdrop wins, else SectionShell's background image.
  return (
    <SectionShell section={heroSection} className={fullClass} backdrop={videoBg}>
      <div className="mx-auto flex max-w-3xl flex-col" style={{ alignItems: "inherit" }}>
        {body}
      </div>
    </SectionShell>
  );
}
