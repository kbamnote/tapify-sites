import type { SectionProps } from "@/lib/types";
import { SectionShell, SectionHeader, Card, isDarkBg } from "./_shared";

interface EmbedItem { url?: string }
interface EmbedProps {
  label?: string;
  heading?: string;
  sub?: string;
  embeds?: EmbedItem[];
}

/**
 * Editor/preview render. The live PHP renderer outputs the real Instagram
 * blockquote + embed.js; in the builder canvas we show a clean placeholder card
 * per link so the layout previews without loading Instagram's script in the
 * editor iframe.
 */
export default function Embed({ section, props }: SectionProps<EmbedProps>) {
  const items = (props.embeds ?? []).filter((e) => e.url && /instagram\.com/i.test(e.url));
  if (!items.length) return null;
  const cols =
    section.variant === "grid-3" ? "sm:grid-cols-2 lg:grid-cols-3"
    : section.variant === "single" ? "max-w-md mx-auto"
    : "sm:grid-cols-2";
  // Instagram's own embed is ~540px wide, which is far too big inside a
  // multi-column grid — cap each card to its column's share.
  const maxW = section.variant === "grid-3" ? 300 : section.variant === "single" ? 540 : 380;

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} light={isDarkBg(section.style)} />
      <div className={section.variant === "single" ? cols : `grid grid-cols-1 gap-6 ${cols}`}>
        {items.map((e, i) => (
          <div key={i} style={{ maxWidth: maxW, width: "100%", margin: "0 auto" }}>
          <Card>
            <a href={e.url} target="_blank" rel="noopener noreferrer" className="block p-5" style={{ textAlign: "center" }}>
              <div
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-white"
                style={{ background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}
                aria-hidden
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <p className="text-sm font-semibold">{/reel/i.test(e.url!) ? "Instagram Reel" : "Instagram Post"}</p>
              <p className="mt-1 truncate text-xs" style={{ color: "var(--tf-text,var(--color-muted))" }}>{e.url}</p>
            </a>
          </Card>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
