import type { SectionProps } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader } from "./_shared";

interface Img { image?: string; alt?: string }
interface GalleryProps {
  label?: string;
  heading?: string;
  sub?: string;
  images?: Img[];
  lightbox?: boolean;
}

export default function Gallery({ section, props }: SectionProps<GalleryProps>) {
  const variant = section.variant ?? "grid-3";
  const images = (props.images ?? []).filter((i) => mediaUrl(i.image));

  // A gallery with no photos is hidden rather than rendered as an empty band.
  if (!images.length) return null;

  const cols =
    variant === "grid-4"
      ? "grid-cols-2 md:grid-cols-4"
      : variant === "slider"
      ? "grid-flow-col auto-cols-[75%] sm:auto-cols-[40%] lg:auto-cols-[30%] overflow-x-auto snap-x"
      : "grid-cols-2 md:grid-cols-3";

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />

      <div className={`grid gap-4 ${cols}`} style={{ scrollbarWidth: "thin" }}>
        {images.map((im, i) => {
          const src = mediaUrl(im.image)!;
          const figure = (
            <figure
              key={i}
              className="group relative overflow-hidden snap-start"
              style={{ borderRadius: "var(--radius)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={im.alt ?? ""}
                loading="lazy"
                className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {im.alt && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-xs text-white">
                  {im.alt}
                </figcaption>
              )}
            </figure>
          );

          return props.lightbox !== false ? (
            <a key={i} href={src} target="_blank" rel="noopener noreferrer" aria-label={im.alt ?? "Open image"}>
              {figure}
            </a>
          ) : (
            figure
          );
        })}
      </div>
    </SectionShell>
  );
}
