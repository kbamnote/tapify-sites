import type { CSSProperties } from "react";
import type { SectionProps } from "@/lib/types";
import { SectionShell, SectionHeader } from "./_shared";
import { SOCIAL_CSS } from "./advisorStyles";

interface SocialItem { network?: string; href?: string; title?: string; text?: string; action?: string }
interface SocialProps { label?: string; heading?: string; sub?: string; items?: SocialItem[] }

/** Brand colour, default label, stroke icon — keep in step with SiteRenderer::SOCIAL_NETWORKS. */
const NETWORKS: Record<string, [string, string, string]> = {
  instagram: ["#E1306C", "Instagram", '<rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.3"/><circle cx="17.6" cy="6.4" r=".9" fill="currentColor"/>'],
  youtube: ["#FF0000", "YouTube", '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor"/>'],
  facebook: ["#1877F2", "Facebook", '<path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3.5H8V21h3.5v-7.5H14l.8-3.5h-3.3V7.8c0-.7.6-1.3 1.3-1.3H15z"/>'],
  whatsapp: ["#25D366", "WhatsApp", '<path d="M3.5 20.5l1.3-4.3A8.5 8.5 0 1 1 8 19.3z"/><path d="M9 8.5c0 3.6 2.9 6.5 6.5 6.5l1.1-1.6-2.2-1-1 .9a5.6 5.6 0 0 1-2.6-2.6l.9-1-1-2.2z"/>'],
  "whatsapp-channel": ["#25D366", "WhatsApp Channel", '<path d="M3 10.5v3a1 1 0 0 0 1 1h2.2L11 18V6L6.2 9.5H4a1 1 0 0 0-1 1z"/><path d="M15 9a4.2 4.2 0 0 1 0 6"/><path d="M17.8 6.2a8.2 8.2 0 0 1 0 11.6"/>'],
  "google-review": ["#FBBC04", "Google Review", '<path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.4 1.1 6.3L12 17.2l-5.7 3 1.1-6.3-4.6-4.4 6.4-.9z"/>'],
  linkedin: ["#0A66C2", "LinkedIn", '<rect x="2.5" y="2.5" width="19" height="19" rx="3"/><path d="M7.5 10.5V17M7.5 7.2v.01M11.5 17v-3.8a2.7 2.7 0 0 1 5.3 0V17M11.5 10.5V17"/>'],
  x: ["#111111", "X", '<path d="M4 4l6.6 8.8L4.3 20h1.9l5.2-6.1L15.8 20H20l-7-9.3L18.9 4H17l-4.8 5.6L8.2 4z"/>'],
  telegram: ["#229ED9", "Telegram", '<path d="M21.5 4 2.5 11.3l6 2 2.2 6.4 3.3-3.9 5 3.7z"/><path d="m8.5 13.3 9-6.3"/>'],
  website: ["", "Website", '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'],
};

/** Connect / Social — mirrors SiteRenderer::secSocial. */
export default function Social({ section, props }: SectionProps<SocialProps>) {
  const items = (props.items ?? []).filter((it) => (it.href ?? "").trim() && NETWORKS[it.network ?? ""]);
  if (!items.length) return null;
  const pills = section.variant === "pills";

  const icon = (net: string) => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden dangerouslySetInnerHTML={{ __html: NETWORKS[net][2] }} />
  );

  return (
    <SectionShell section={section}>
      <style>{SOCIAL_CSS}</style>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />
      {/* Balanced rows (six cards = 3 + 3), as SiteRenderer::secSocial. */}
      <div className={pills ? "tf-sc-pills" : "tf-scs"}
           style={{ "--sc-cols": items.length <= 5 ? items.length : items.length % 3 === 0 ? 3 : 4 } as CSSProperties}>
        {items.map((it, i) => {
          const [color, label] = NETWORKS[it.network as string];
          const style = { "--sc": color || "var(--color-primary)" } as CSSProperties;
          const title = it.title?.trim() || label;
          const ext = /^https?:\/\//i.test(it.href ?? "") ? { target: "_blank", rel: "noopener noreferrer" } : {};
          return pills ? (
            <a key={i} className="tf-sc-pill" href={it.href} style={style} {...ext}>
              <span className="tf-sc-ic">{icon(it.network as string)}</span>{title}
            </a>
          ) : (
            <a key={i} className="tf-sc" href={it.href} style={style} {...ext}>
              <span className="tf-sc-ic">{icon(it.network as string)}</span>
              <span className="tf-sc-t">{title}</span>
              {it.text && <span className="tf-sc-x">{it.text}</span>}
              {it.action && <span className="tf-sc-a">{it.action} <span aria-hidden>→</span></span>}
            </a>
          );
        })}
      </div>
    </SectionShell>
  );
}
