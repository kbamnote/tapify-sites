import type { SectionProps } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell } from "./_shared";

interface Col { title?: string; links?: { text?: string; href?: string }[] }
interface SocialIcon { icon?: string; href?: string; label?: string }
interface FooterProps {
  logo?: string;
  blurb?: string;
  showSocial?: boolean;
  socialIcons?: SocialIcon[];
  socialIconSize?: "small" | "medium" | "large" | "extra-large";
  showContact?: boolean;
  showHours?: boolean;
  columns?: Col[];
  copyright?: string;
  showBranding?: boolean;
}

const SOCIAL_LABEL: Record<string, string> = {
  facebook: "Facebook", instagram: "Instagram", youtube: "YouTube",
  linkedin: "LinkedIn", twitter: "X", telegram: "Telegram",
};

export default function Footer({ section, props, doc }: SectionProps<FooterProps>) {
  const biz = doc.business ?? {};
  const logo = mediaUrl(props.logo);
  const simple = section.variant === "simple";

  const socials = Object.entries(biz.social ?? {}).filter(([, url]) => !!url && String(url).trim() !== "");
  const socialIcons = (props.socialIcons ?? []).filter((s) => s.icon && s.href);
  const iconPx = ({ small: 28, medium: 36, large: 48, "extra-large": 64 } as const)[props.socialIconSize ?? "medium"] ?? 36;

  const brand = (
    <div>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={doc.site.name} className="h-10 w-auto object-contain" />
      ) : (
        <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{doc.site.name}</p>
      )}
      {props.blurb && <p className="mt-3 max-w-sm text-sm opacity-75">{props.blurb}</p>}

      {props.showSocial !== false && !!socials.length && (
        <div className="mt-4 flex flex-wrap gap-3" style={{ justifyContent: "inherit" }}>
          {socials.map(([k, url]) => (
            <a
              key={k}
              href={String(url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs opacity-75 hover:opacity-100 hover:underline"
            >
              {SOCIAL_LABEL[k] ?? k}
            </a>
          ))}
        </div>
      )}

      {!!socialIcons.length && (
        <div className="mt-4 flex flex-wrap items-center gap-3" style={{ justifyContent: "inherit" }}>
          {socialIcons.map((s, i) => (
            <a
              key={i}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label || "Social link"}
              title={s.label || undefined}
              className="inline-flex opacity-80 transition-opacity hover:opacity-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(s.icon)} alt={s.label || ""} className="object-contain" style={{ width: iconPx, height: iconPx }} />
            </a>
          ))}
        </div>
      )}
    </div>
  );

  const contact = props.showContact !== false && (biz.phone || biz.email || biz.address) && (
    <div style={{ textAlign: "left" }}>
      <p className="mb-3 text-sm font-semibold">Contact</p>
      <ul className="space-y-1.5 text-sm opacity-75">
        {biz.phone && <li><a className="hover:underline" href={`tel:${biz.phone}`}>{biz.phone}</a></li>}
        {biz.email && <li><a className="hover:underline" href={`mailto:${biz.email}`}>{biz.email}</a></li>}
        {biz.address && <li>{biz.address}</li>}
      </ul>
    </div>
  );

  const year = new Date().getFullYear();
  const copy = props.copyright?.trim() || `© ${year} ${doc.site.name}. All rights reserved.`;

  return (
    <SectionShell section={section}>
      {simple ? (
        <div className="text-center">{brand}</div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4" style={{ textAlign: "left" }}>
          {brand}
          {(props.columns ?? []).map((c, i) => (
            <div key={i}>
              <p className="mb-3 text-sm font-semibold">{c.title}</p>
              <ul className="space-y-1.5 text-sm opacity-75">
                {(c.links ?? []).map((l, j) => (
                  <li key={j}>
                    <a href={l.href} className="hover:underline hover:opacity-100">{l.text}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {contact}
        </div>
      )}

      <div
        className="mt-8 flex flex-col items-center justify-between gap-2 pt-6 text-xs opacity-60 sm:flex-row"
        style={{ borderTop: "1px solid rgba(255,255,255,.15)" }}
      >
        <p>{copy}</p>
        {props.showBranding !== false && (
          <p>
            Powered by{" "}
            <a href="https://tapify.co.in" target="_blank" rel="noopener noreferrer" className="underline">
              Tapify
            </a>
          </p>
        )}
      </div>
    </SectionShell>
  );
}
