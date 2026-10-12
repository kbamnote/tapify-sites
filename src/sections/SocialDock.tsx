import type { CSSProperties } from "react";
import type { SectionProps } from "@/lib/types";

interface DockItem { network?: string; href?: string; title?: string }
interface DockProps {
  items?: DockItem[];
  position?: "left" | "right";
  size?: "sm" | "md" | "lg";
  colour?: "brand" | "theme" | "dark";
  mobile?: "bottom" | "side" | "hide";
}

/**
 * Floating social bar — icons pinned to the edge of the window.
 *
 * Deliberately NOT wrapped in SectionShell. Every other section is a band in
 * the page flow and the shell gives it padding, a background and an alignment;
 * this one is fixed to the viewport and takes no space in the flow at all, so
 * the shell would only add a stray empty block wherever the section happens to
 * sit in the page.
 *
 * It is rendered once per page by the route, the same way the header and footer
 * are, so "add it to one page" means "it is on every page" — which is what a
 * floating bar has to be to make any sense.
 *
 * Icons are the set in Social.tsx; keep the two in step with
 * SiteRenderer::SOCIAL_NETWORKS.
 */

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

const SIZES: Record<string, [number, number]> = { sm: [34, 17], md: [42, 20], lg: [50, 24] };

/**
 * `tf-dock-*` rather than anything generic: this is `position: fixed` and sits
 * above the whole page, so a class name that collided with a customer's own
 * styling would be very hard to diagnose.
 *
 * The phone rule is the part worth reading. A vertical strip down the side of a
 * 360px screen eats the edge of the content and lands under the thumb, so by
 * default the bar becomes a centred row along the bottom — above the safe-area
 * inset, so it clears the iOS home indicator rather than sitting under it.
 */
const CSS = `
.tf-dock{position:fixed;top:50%;transform:translateY(-50%);z-index:60;display:flex;
  flex-direction:column;gap:var(--dk-gap,8px);pointer-events:none}
.tf-dock-left{left:max(10px,env(safe-area-inset-left))}
.tf-dock-right{right:max(10px,env(safe-area-inset-right))}
.tf-dock a{pointer-events:auto;display:grid;place-items:center;
  width:var(--dk-size,42px);height:var(--dk-size,42px);
  border-radius:var(--dk-radius,50%);background:var(--dk-bg,#fff);color:var(--dk-fg,#111);
  box-shadow:0 2px 10px rgba(0,0,0,.16);text-decoration:none;
  transition:transform .16s ease,box-shadow .16s ease,background .16s ease}
.tf-dock a:hover{transform:translateX(var(--dk-nudge,3px));box-shadow:0 5px 18px rgba(0,0,0,.24)}
.tf-dock-right a:hover{transform:translateX(calc(var(--dk-nudge,3px) * -1))}
.tf-dock a:focus-visible{outline:3px solid var(--color-primary,#153E3F);outline-offset:3px}

/* Joined strip: one rounded block, square corners between the icons. */
.tf-dock-rail{gap:0;border-radius:var(--dk-radius,14px);overflow:hidden;
  box-shadow:0 2px 14px rgba(0,0,0,.18)}
.tf-dock-rail a{border-radius:0;box-shadow:none}
.tf-dock-rail a:hover{transform:none;filter:brightness(1.12)}

@media (max-width:640px){
  .tf-dock-mobile-hide{display:none}
  .tf-dock-mobile-bottom{top:auto;bottom:max(10px,env(safe-area-inset-bottom));
    left:50%;right:auto;transform:translateX(-50%);flex-direction:row}
  .tf-dock-mobile-bottom a:hover{transform:none}
  .tf-dock-mobile-bottom.tf-dock-rail{flex-direction:row}
}
@media (prefers-reduced-motion:reduce){
  .tf-dock a,.tf-dock a:hover{transition:none;transform:none}
}
`;

export default function SocialDock({ section, props }: SectionProps<DockProps>) {
  const items = (props.items ?? []).filter((it) => (it.href ?? "").trim() && NETWORKS[it.network ?? ""]);
  if (!items.length) return null;

  const rail = section.variant === "rail";
  const side = props.position === "right" ? "right" : "left";
  const [box, glyph] = SIZES[props.size ?? "md"] ?? SIZES.md;
  const mobile = props.mobile ?? "bottom";

  const vars = {
    "--dk-size": box + "px",
    "--dk-gap": rail ? "0" : "8px",
    // The strip leans outward on hover, so the nudge has to point away from the
    // edge it is pinned to.
    "--dk-nudge": side === "left" ? "3px" : "-3px",
  } as CSSProperties;

  const cls = [
    "tf-dock",
    "tf-dock-" + side,
    rail ? "tf-dock-rail" : "tf-dock-bubbles",
    "tf-dock-mobile-" + mobile,
  ].join(" ");

  return (
    <>
      <style>{CSS}</style>
      <nav className={cls} style={vars} aria-label="Social links">
        {items.map((it, i) => {
          const [brand, label] = NETWORKS[it.network as string];
          const title = it.title?.trim() || label;

          // "brand" paints the platform's own colour; the other two keep the
          // bar quiet so it does not fight the page for attention.
          const skin: CSSProperties =
            props.colour === "theme"
              ? { background: "var(--color-primary, #153E3F)", color: "#fff" }
              : props.colour === "dark"
                ? { background: "#111827", color: "#fff" }
                : { background: brand || "var(--color-primary, #153E3F)", color: "#fff" };

          // Only http(s) links leave the site; mailto:, tel: and in-site paths
          // must open in the same tab or they do nothing useful.
          const ext = /^https?:\/\//i.test(it.href ?? "")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {};

          return (
            <a key={i} href={it.href} style={skin} title={title} aria-label={title} {...ext}>
              <svg
                width={glyph} height={glyph} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden
                dangerouslySetInnerHTML={{ __html: NETWORKS[it.network as string][2] }}
              />
            </a>
          );
        })}
      </nav>
    </>
  );
}
