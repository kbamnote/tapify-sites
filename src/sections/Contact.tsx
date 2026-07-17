import type { SectionProps } from "@/lib/types";
import { SectionShell, SectionHeader, Card } from "./_shared";

interface ContactProps {
  label?: string;
  heading?: string;
  sub?: string;
  showPhone?: boolean;
  showWhatsapp?: boolean;
  showEmail?: boolean;
  showAddress?: boolean;
  showHours?: boolean;
  showMap?: boolean;
  mapUrl?: string;
  formId?: string;
}

const DAY_LABEL: Record<string, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
};

/** Turn a plain Google Maps link/address into an embeddable URL (no API key). */
function embedMap(mapUrl?: string, address?: string): string | null {
  const q = mapUrl?.trim() || address?.trim();
  if (!q) return null;
  if (/\/maps\/embed|output=embed/.test(q)) return q;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
}

export default function Contact({ section, props, doc }: SectionProps<ContactProps>) {
  const biz = doc.business ?? {};
  const variant = section.variant ?? "form-map";
  const form = doc.forms?.find((f) => f.id === props.formId) ?? doc.forms?.[0];

  const rows: { label: string; value: string; href?: string }[] = [];
  if (props.showPhone !== false && biz.phone) rows.push({ label: "Phone", value: biz.phone, href: `tel:${biz.phone}` });
  if (props.showWhatsapp !== false && biz.whatsapp)
    rows.push({ label: "WhatsApp", value: biz.whatsapp, href: `https://wa.me/${biz.whatsapp.replace(/\D/g, "")}` });
  if (props.showEmail !== false && biz.email) rows.push({ label: "Email", value: biz.email, href: `mailto:${biz.email}` });
  if (props.showAddress !== false && biz.address) rows.push({ label: "Address", value: biz.address });

  const mapSrc = props.showMap !== false && (variant === "form-map" || variant === "details-map")
    ? embedMap(props.mapUrl ?? biz.mapUrl, biz.address)
    : null;

  const details = (
    <div className="space-y-4" style={{ textAlign: "left" }}>
      {rows.map((r) => (
        <div key={r.label}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>
            {r.label}
          </p>
          {r.href ? (
            <a href={r.href} className="text-sm hover:underline" style={{ color: "var(--color-text)" }}>
              {r.value}
            </a>
          ) : (
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>{r.value}</p>
          )}
        </div>
      ))}

      {props.showHours && !!biz.hours?.length && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>Hours</p>
          <ul className="mt-1 space-y-0.5 text-sm" style={{ color: "var(--color-muted)" }}>
            {biz.hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-6">
                <span>{DAY_LABEL[h.day] ?? h.day}</span>
                <span>{h.closed ? "Closed" : `${h.open ?? ""} – ${h.close ?? ""}`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  /**
   * Posts straight to the backend. Progressive enhancement: this works with no
   * JavaScript; the builder can layer AJAX on later without changing the markup.
   */
  const formEl = form && (
    <form
      method="post"
      action={`${process.env.NEXT_PUBLIC_TAPIFY_API ?? "https://app.tapify.co.in/api"}/sites/form-submit.php`}
      className="space-y-3"
      style={{ textAlign: "left" }}
    >
      <input type="hidden" name="form_id" value={form.id} />
      {form.fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="mb-1 block text-xs font-semibold">
            {f.label}{f.required ? " *" : ""}
          </label>
          {f.type === "textarea" ? (
            <textarea
              id={f.name} name={f.name} required={f.required} placeholder={f.placeholder} rows={4}
              className="w-full px-3 py-2 text-sm"
              style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", background: "var(--color-bg)" }}
            />
          ) : f.type === "select" ? (
            <select
              id={f.name} name={f.name} required={f.required}
              className="w-full px-3 py-2 text-sm"
              style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", background: "var(--color-bg)" }}
            >
              {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input
              id={f.name} name={f.name} type={f.type} required={f.required} placeholder={f.placeholder}
              className="w-full px-3 py-2 text-sm"
              style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", background: "var(--color-bg)" }}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="px-6 py-3 text-sm font-semibold"
        style={{ background: "var(--color-primary)", color: "var(--color-primary-fg)", borderRadius: "var(--radius)" }}
      >
        {form.submitText ?? "Send"}
      </button>
    </form>
  );

  const left = variant === "form-only" || variant === "form-map" ? formEl ?? details : details;

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} />

      {variant === "cards" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((r) => (
            <Card key={r.label} className="p-5 text-center">
              <p className="text-xs font-semibold uppercase" style={{ color: "var(--color-accent)" }}>{r.label}</p>
              {r.href ? (
                <a href={r.href} className="mt-2 block text-sm hover:underline">{r.value}</a>
              ) : (
                <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>{r.value}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className={mapSrc ? "grid grid-cols-1 gap-8 lg:grid-cols-2" : "mx-auto max-w-2xl"}>
          <div>
            {variant === "form-map" && formEl ? (
              <>
                {formEl}
                <div className="mt-6">{details}</div>
              </>
            ) : (
              left
            )}
          </div>
          {mapSrc && (
            <iframe
              src={mapSrc}
              title="Map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full lg:h-full"
              style={{ border: 0, borderRadius: "var(--radius)", minHeight: 320 }}
            />
          )}
        </div>
      )}
    </SectionShell>
  );
}
