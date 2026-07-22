import type { SectionProps } from "@/lib/types";
import { SectionShell, SectionHeader, isDarkBg } from "./_shared";

interface ShareProps {
  label?: string;
  heading?: string;
  sub?: string;
  url?: string;
  showQr?: boolean;
  whatsapp?: boolean;
  facebook?: boolean;
  twitter?: boolean;
}

export default function Share({ section, props, doc, siteSlug }: SectionProps<ShareProps>) {
  const url = props.url?.trim() || (siteSlug ? `https://${siteSlug}.tapify.co.in` : "https://example.tapify.co.in");
  const enc = encodeURIComponent(url);
  const title = encodeURIComponent(doc.site?.name ?? "Check this out");
  const light = isDarkBg(section.style);
  const btnStyle = {
    border: "1px solid var(--color-border)",
    color: light ? "#fff" : "var(--color-text)",
    borderRadius: "var(--radius)",
  };
  const btnCls = "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold no-underline";

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} light={light} />
      {props.showQr !== false && (
        <div className="mb-6">
          <div className="inline-block rounded-[var(--radius)] p-3.5" style={{ background: "#fff", boxShadow: "0 8px 24px rgba(16,24,40,.12)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${enc}`}
              alt="QR code"
              width={200}
              height={200}
              style={{ display: "block" }}
            />
          </div>
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-2.5">
        {props.whatsapp !== false && (
          <a className={btnCls} style={btnStyle} href={`https://wa.me/?text=${title}%20${enc}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        )}
        {props.facebook !== false && (
          <a className={btnCls} style={btnStyle} href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`} target="_blank" rel="noopener noreferrer">Facebook</a>
        )}
        {props.twitter !== false && (
          <a className={btnCls} style={btnStyle} href={`https://twitter.com/intent/tweet?url=${enc}&text=${title}`} target="_blank" rel="noopener noreferrer">X</a>
        )}
        <span className={btnCls} style={btnStyle}>Copy link</span>
      </div>
    </SectionShell>
  );
}
