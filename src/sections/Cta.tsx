import type { SectionProps, Link as LinkT } from "@/lib/types";
import { SectionShell, CtaButton, isDarkBg } from "./_shared";

interface CtaProps {
  heading?: string;
  sub?: string;
  ctaPrimary?: LinkT;
  ctaSecondary?: LinkT;
  showWhatsapp?: boolean;
  showCall?: boolean;
}

export default function Cta({ section, props, doc }: SectionProps<CtaProps>) {
  const biz = doc.business ?? {};
  const split = section.variant === "split";
  // "card" paints its own primary panel, so treat it as dark regardless of the section bg.
  const onDark = isDarkBg(section.style) || section.variant === "card";

  const buttons = (
    <div className="flex flex-wrap gap-3" style={{ justifyContent: split ? "flex-end" : "inherit" }}>
      <CtaButton link={props.ctaPrimary} onDark={onDark} />
      <CtaButton link={props.ctaSecondary} fallbackStyle="ghost" onDark={onDark} />
      {props.showWhatsapp && biz.whatsapp && (
        <CtaButton onDark={onDark} link={{ text: "WhatsApp", href: `https://wa.me/${biz.whatsapp.replace(/\D/g, "")}`, newTab: true, style: "ghost" }} />
      )}
      {props.showCall && biz.phone && (
        <CtaButton onDark={onDark} link={{ text: "Call now", href: `tel:${biz.phone}`, style: "ghost" }} />
      )}
    </div>
  );

  const text = (
    <div>
      {props.heading && (
        <h2 className="text-2xl md:text-3xl font-bold leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {props.heading}
        </h2>
      )}
      {props.sub && <p className="mt-2 text-base opacity-90">{props.sub}</p>}
    </div>
  );

  if (split) {
    return (
      <SectionShell section={section}>
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2" style={{ textAlign: "left" }}>
          {text}
          {buttons}
        </div>
      </SectionShell>
    );
  }

  // banner / card
  const inner = (
    <div className="mx-auto max-w-2xl">
      {text}
      <div className="mt-6 flex flex-wrap gap-3" style={{ justifyContent: "inherit" }}>
        {buttons.props.children}
      </div>
    </div>
  );

  if (section.variant === "card") {
    return (
      <SectionShell section={section}>
        <div
          className="mx-auto max-w-3xl p-8"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-primary-fg)",
            borderRadius: "var(--radius)",
          }}
        >
          {inner}
        </div>
      </SectionShell>
    );
  }

  return <SectionShell section={section}>{inner}</SectionShell>;
}
