import type { ReactNode } from "react";
import type { SectionProps } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader } from "./_shared";
import Carousel from "./Carousel";

interface ReelItem {
  video?: string;
  videoUrl?: string;
  poster?: string;
  title?: string;
  reelUrl?: string;
  detailsUrl?: string;
  waMessage?: string;
}
interface ReelsProps {
  label?: string;
  heading?: string;
  sub?: string;
  profileUrl?: string;
  followText?: string;
  whatsapp?: string;
  whatsappText?: string;
  items?: ReelItem[];
}

const IgIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" />
  </svg>
);

/**
 * Reels — mirrors SiteRenderer::secReels.
 *
 * Every clip plays at once, muted and looping. A wall of motion is the point;
 * a row of posters with play buttons is a different, deader thing. Muted
 * because browsers will not autoplay sound, and playsInline because iOS
 * otherwise throws the first clip fullscreen.
 *
 * Close to Watch & Buy but a separate section, not a variant of it: that one
 * sells one product per clip through a player dialog, this one is a feed whose
 * every action leaves the page — Instagram, a product page, or WhatsApp.
 */
export default function Reels({ section, props }: SectionProps<ReelsProps>) {
  const variant = section.variant ?? "carousel";
  const waBtn = (props.whatsappText ?? "").trim() || "Buy on WhatsApp";
  const follow = (props.followText ?? "").trim() || "Follow us on Instagram";
  const profile = (props.profileUrl ?? "").trim();

  // Digits only — what wa.me accepts.
  const waNumber = (props.whatsapp ?? "").replace(/\D+/g, "");

  const cards: ReactNode[] = [];
  (props.items ?? []).forEach((it, i) => {
    const src = mediaUrl(it.video) || (it.videoUrl ?? "").trim();
    if (!src) return; // no clip: no tile, same as the renderer
    const poster = mediaUrl(it.poster);
    const title = (it.title ?? "").trim();
    const reel = (it.reelUrl ?? "").trim();
    const details = (it.detailsUrl ?? "").trim();

    const msg =
      (it.waMessage ?? "").trim() ||
      (title ? `Hi, I am interested in ${title}` : "Hi, I am interested in this product");
    const waHref = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}` : "";

    cards.push(
      <figure
        key={i}
        className="m-0 flex flex-col overflow-hidden"
        style={{
          borderRadius: "var(--radius)",
          background: "var(--color-surface)",
          border: "1px solid color-mix(in srgb, var(--color-text) 10%, transparent)",
        }}
      >
        <div className="relative bg-[#111]" style={{ aspectRatio: "9 / 16" }}>
          <video
            src={src}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          {reel && (
            <a
              href={reel}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={title ? `Open "${title}" on Instagram` : "Open on Instagram"}
              className="absolute right-2.5 top-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-black/45 text-white no-underline"
            >
              <IgIcon />
            </a>
          )}
        </div>

        <figcaption className="flex flex-col gap-[9px] p-3">
          {title && (
            <span className="text-[14.5px] font-semibold leading-snug" style={{ color: "var(--color-text)" }}>
              {title}
            </span>
          )}

          {/* Whichever of the two is missing, the other takes the full width
              rather than leaving a gap. */}
          {(reel || details) && (
            <div className="flex gap-2">
              {reel && (
                <a
                  href={reel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-[7px] text-[13.5px] font-semibold no-underline"
                  style={{
                    color: "var(--color-text)",
                    border: "1px solid color-mix(in srgb, var(--color-text) 18%, transparent)",
                  }}
                >
                  <IgIcon /> Instagram
                </a>
              )}
              {details && (
                <a
                  href={details}
                  className="flex min-h-[38px] flex-1 items-center justify-center rounded-lg px-2.5 py-[7px] text-[13.5px] font-semibold no-underline"
                  style={{
                    color: "var(--color-text)",
                    border: "1px solid color-mix(in srgb, var(--color-text) 18%, transparent)",
                  }}
                >
                  Details
                </a>
              )}
            </div>
          )}

          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[42px] items-center justify-center rounded-lg bg-[#25D366] px-3 py-[9px] text-[14.5px] font-bold text-white no-underline"
            >
              {waBtn}
            </a>
          )}
        </figcaption>
      </figure>
    );
  });

  if (!cards.length) return null;

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
      {profile && (
        <div className="-mt-1.5 mb-3.5 flex justify-end">
          <a
            href={profile}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b pb-px text-sm font-semibold no-underline"
            style={{ color: "var(--color-text)" }}
          >
            {follow}
          </a>
        </div>
      )}
      {variant === "grid" ? (
        <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
          {cards}
        </div>
      ) : (
        <Carousel slides={cards} autoplayMs={0} />
      )}
    </SectionShell>
  );
}
