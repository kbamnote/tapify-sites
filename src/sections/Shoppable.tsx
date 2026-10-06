import type { ReactNode } from "react";
import type { SectionProps } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader } from "./_shared";
import Carousel from "./Carousel";

interface ShoppableItem {
  video?: string;
  videoUrl?: string;
  preview?: string;
  previewUrl?: string;
  poster?: string;
  productTitle?: string;
  productImage?: string;
  price?: string;
  mrp?: string;
  href?: string;
}
interface ShoppableProps {
  label?: string;
  heading?: string;
  sub?: string;
  items?: ShoppableItem[];
  buttonText?: string;
}

/**
 * Watch & Buy — mirrors SiteRenderer::secShoppable.
 *
 * In the editor each tile loops its preview clip with the product card pinned
 * to the bottom, exactly as on the published page. Tapping a tile does not open
 * the player here: a click on the canvas selects the section, and hijacking it
 * for a video dialog would make the section impossible to edit.
 */
export default function Shoppable({ section, props }: SectionProps<ShoppableProps>) {
  const variant = section.variant ?? "carousel";

  const cards: ReactNode[] = [];
  (props.items ?? []).forEach((it, i) => {
    const full = mediaUrl(it.video) || (it.videoUrl ?? "").trim();
    if (!full) return; // nothing to play: nothing drawn, same as the renderer
    const preview = mediaUrl(it.preview) || (it.previewUrl ?? "").trim() || full;
    const poster = mediaUrl(it.poster);
    const thumb = mediaUrl(it.productImage);
    const title = (it.productTitle ?? "").trim();

    cards.push(
      <figure
        key={i}
        className="relative m-0 overflow-hidden bg-[#111]"
        style={{ aspectRatio: "9 / 16", borderRadius: "var(--radius)" }}
      >
        <video
          src={preview}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span
          aria-hidden
          className="absolute right-2.5 top-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-black/45"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.24-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z" />
          </svg>
        </span>
        {title && (
          <div
            className="absolute bottom-2 left-2 right-2 flex items-center gap-2.5 p-[7px] text-left shadow-lg"
            style={{ background: "var(--color-surface)", color: "var(--color-text)", borderRadius: "max(4px, calc(var(--radius) - 4px))" }}
          >
            {thumb && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt="" className="h-[46px] w-[46px] shrink-0 rounded object-cover" />
            )}
            <span className="flex min-w-0 flex-col gap-[3px]">
              <span className="line-clamp-2 text-[12.5px] font-semibold leading-tight">{title}</span>
              {it.price && (
                <span className="text-[13.5px] font-bold">
                  {it.price}
                  {it.mrp && (
                    <s className="ml-1 text-xs font-normal" style={{ color: "var(--color-muted)" }}>{it.mrp}</s>
                  )}
                </span>
              )}
            </span>
          </div>
        )}
      </figure>
    );
  });

  if (!cards.length) return null;

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
      {variant === "grid" ? (
        <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" }}>
          {cards}
        </div>
      ) : (
        <Carousel slides={cards} autoplayMs={0} />
      )}
    </SectionShell>
  );
}
