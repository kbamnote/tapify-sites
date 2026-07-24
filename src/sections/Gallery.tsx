import type { SectionProps } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader, imageFitStyle , type Crop} from "./_shared";
import Carousel from "./Carousel";
import Marquee from "./Marquee";

interface Img { image?: string; alt?: string; fit?: string | Crop }
interface GalleryProps {
  label?: string;
  heading?: string;
  sub?: string;
  images?: Img[];
  lightbox?: boolean;
  imageFit?: string | Crop;
}

export default function Gallery({ section, props }: SectionProps<GalleryProps>) {
  const variant = section.variant ?? "grid-3";
  const images = (props.images ?? []).filter((i) => mediaUrl(i.image));

  // A gallery with no photos is hidden rather than rendered as an empty band.
  if (!images.length) return null;

  const slides = images.map((im, i) => {
    const src = mediaUrl(im.image)!;
    const figure = (
      <figure className="group relative h-full overflow-hidden" style={{ borderRadius: "var(--radius)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={im.alt ?? ""}
          loading="lazy"
          className="h-52 w-full transition-transform duration-500 group-hover:scale-105"
          style={imageFitStyle(im.fit ?? props.imageFit)}
        />
        {im.alt && (
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-xs text-white">
            {im.alt}
          </figcaption>
        )}
      </figure>
    );

    return props.lightbox !== false ? (
      <a key={i} href={src} target="_blank" rel="noopener noreferrer" aria-label={im.alt ?? "Open image"} className="block">
        {figure}
      </a>
    ) : (
      <div key={i}>{figure}</div>
    );
  });

  const cols = variant === "grid-4" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3";

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />

      {variant === "marquee" ? (
        <Marquee slides={slides} />
      ) : variant === "slider" ? (
        <Carousel slides={slides} />
      ) : (
        <div className={`grid gap-4 ${cols}`}>{slides}</div>
      )}
    </SectionShell>
  );
}
