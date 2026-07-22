import type { SectionProps } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader, Card, imageFitStyle } from "./_shared";

interface Pillar { icon?: string; title?: string; text?: string }
interface AboutProps {
  label?: string;
  heading?: string;
  body?: string;
  image?: string;
  showPillars?: boolean;
  pillars?: Pillar[];
  imageFit?: string;
}

export default function About({ section, props }: SectionProps<AboutProps>) {
  const variant = section.variant ?? "image-left";
  const img = mediaUrl(props.image);
  const hasImage = variant !== "text-only" && !!img;

  const text = (
    <div>
      <SectionHeader label={props.label} heading={props.heading} />
      {props.body && (
        <p className="whitespace-pre-line text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {props.body}
        </p>
      )}
      {props.showPillars && !!props.pillars?.length && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {props.pillars.map((p, i) => (
            <Card key={i} className="p-5">
              <h3 className="text-base font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                {p.title}
              </h3>
              {p.text && (
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  {p.text}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (!hasImage) {
    return (
      <SectionShell section={section}>
        <div className="mx-auto max-w-3xl">{text}</div>
      </SectionShell>
    );
  }

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img}
      alt={props.heading ?? "About"}
      className="w-full"
      style={{ borderRadius: "var(--radius)", maxHeight: 460, ...imageFitStyle(props.imageFit) }}
      loading="lazy"
    />
  );

  return (
    <SectionShell section={section}>
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2" style={{ textAlign: "left" }}>
        {variant === "image-left" ? (
          <>
            {image}
            {text}
          </>
        ) : (
          <>
            {text}
            {image}
          </>
        )}
      </div>
    </SectionShell>
  );
}
