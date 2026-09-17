import type { ReactNode } from "react";
import type { SectionProps } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader } from "./_shared";
import Carousel from "./Carousel";

interface VideoItem { video?: string; url?: string; poster?: string; title?: string; caption?: string }
interface VideosProps {
  label?: string;
  heading?: string;
  sub?: string;
  items?: VideoItem[];
  shape?: "landscape" | "portrait" | "square";
  playback?: "click" | "muted-loop";
}

type Source =
  | { kind: "file"; src: string }
  | { kind: "youtube"; id: string; vertical: boolean }
  | { kind: "vimeo"; id: string }
  | { kind: "instagram"; id: string };

/** Mirrors SiteRenderer::videoSource — keep the patterns in step. */
function videoSource(it: VideoItem): Source | null {
  const file = mediaUrl(it.video);
  if (file) return { kind: "file", src: file };
  const url = (it.url ?? "").trim();
  if (!url) return null;
  let m = url.match(/(?:youtube\.com\/(?:watch\?(?:\S*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  if (m) return { kind: "youtube", id: m[1], vertical: /\/shorts\//i.test(url) };
  m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (m) return { kind: "vimeo", id: m[1] };
  m = url.match(/instagram\.com\/(?:reels?|p|tv)\/([\w-]+)/i);
  if (m) return { kind: "instagram", id: m[1] };
  if (/^https?:\/\/\S+\.(?:mp4|webm|mov)(?:\?\S*)?$/i.test(url)) return { kind: "file", src: url };
  return null;
}

const RATIO: Record<string, string> = { portrait: "9 / 16", square: "1 / 1", landscape: "16 / 9" };

/**
 * Videos — mirrors SiteRenderer::secVideos. In the editor, YouTube shows its
 * cover picture with a play button (the published page swaps in the player on
 * tap), so the canvas stays light and clicks still select the section.
 */
export default function Videos({ section, props }: SectionProps<VideosProps>) {
  const variant = section.variant ?? "grid-2";
  const loop = props.playback === "muted-loop";
  const shape = RATIO[props.shape ?? "landscape"] ?? RATIO.landscape;

  const cards: ReactNode[] = [];
  (props.items ?? []).forEach((it, i) => {
    const v = videoSource(it);
    if (!v) return;
    const poster = mediaUrl(it.poster);
    let ratio = shape;
    let player: ReactNode;
    const frame = (src: string) => (
      <iframe src={src} title={it.title || "Video"} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
    );
    const cover = (thumb: string) => (
      <div className="absolute inset-0 bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover opacity-90" />
        <span aria-hidden className="absolute left-1/2 top-1/2 flex h-[70px] w-[70px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 shadow-lg">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 4 }}>
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.24-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z" />
          </svg>
        </span>
      </div>
    );

    if (v.kind === "file") {
      player = loop ? (
        <video src={v.src} poster={poster} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        // "#t=0.1" paints the first frame when there is no cover picture (as the PHP renderer does).
        <video src={!poster && !v.src.includes("#") ? `${v.src}#t=0.1` : v.src} poster={poster} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full bg-black object-contain" />
      );
    } else if (v.kind === "youtube") {
      if (v.vertical) ratio = RATIO.portrait;
      player = loop
        ? frame(`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&mute=1&loop=1&playlist=${v.id}&controls=0&playsinline=1&rel=0`)
        : cover(poster || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`);
    } else if (v.kind === "vimeo") {
      const base = `https://player.vimeo.com/video/${v.id}?dnt=1`;
      player = loop ? frame(`${base}&autoplay=1&muted=1&loop=1&background=1`) : poster ? cover(poster) : frame(base);
    } else {
      ratio = RATIO.portrait;
      player = frame(`https://www.instagram.com/p/${v.id}/embed/`);
    }

    const narrow = variant === "single" && ratio === RATIO.portrait;
    cards.push(
      <figure key={i} className="m-0 min-w-0 text-left">
        <div
          className={`relative w-full overflow-hidden bg-black shadow-lg ${narrow ? "mx-auto max-w-[420px]" : ""}`}
          style={{ aspectRatio: ratio, borderRadius: "var(--radius)" }}
        >
          {player}
        </div>
        {(it.title || it.caption) && (
          <figcaption className={`mt-3 ${variant === "single" && section.style?.align === "center" ? "text-center" : ""}`}>
            {it.title && (
              <p className="text-[17px] font-semibold leading-snug" style={{ fontFamily: "var(--font-heading)", color: "var(--tf-heading,inherit)" }}>{it.title}</p>
            )}
            {it.caption && (
              <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--tf-text,var(--color-muted))" }}>{it.caption}</p>
            )}
          </figcaption>
        )}
      </figure>
    );
  });

  if (!cards.length) return null;

  const grid =
    variant === "single" ? "mx-auto grid max-w-[960px] grid-cols-1 gap-7"
    : variant === "grid-3" ? "grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3"
    : "grid grid-cols-1 gap-7 sm:grid-cols-2";

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
      {variant === "carousel" ? <Carousel slides={cards} autoplayMs={0} /> : <div className={grid}>{cards}</div>}
    </SectionShell>
  );
}
