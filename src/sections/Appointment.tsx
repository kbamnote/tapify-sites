import type { SectionProps } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { SectionShell, SectionHeader, isDarkBg, imageFitStyle , type Crop} from "./_shared";

interface AppointmentProps {
  label?: string;
  heading?: string;
  sub?: string;
  submitText?: string;
  alsoNotify?: "whatsapp" | "email" | "none";
  services?: string[];
  image?: string;
  imageFit?: string | Crop;
}

/** Half-hour slots in 12-hour AM/PM form — matches the published renderer. */
const TIMES: string[] = (() => {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const ampm = h < 12 ? "AM" : "PM";
      out.push(`${String((h % 12) || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`);
    }
  }
  return out;
})();

/**
 * Editor/preview render — a faithful static form. The live PHP renderer wires the
 * submit to open WhatsApp/email with the filled details (no backend), so the
 * canvas just needs to show the layout.
 */
export default function Appointment({ section, props }: SectionProps<AppointmentProps>) {
  const light = isDarkBg(section.style);
  const services = (props.services ?? []).filter(Boolean);
  const inputCls = "w-full rounded-[var(--radius)] border px-3 py-2.5 text-sm";
  const inputStyle = { borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" };
  const lbl = "mb-1 block text-xs font-semibold";

  // Split layouts put a photo beside the form; the form then fills its column.
  const img = mediaUrl(props.image);
  const split = (section.variant === "image-left" || section.variant === "image-right") && !!img;

  const form = (
    <form className={`grid gap-3 ${split ? "" : "mx-auto max-w-md"}`} style={{ textAlign: "left" }}>
        <div><label className={lbl}>Name *</label><input className={inputCls} style={inputStyle} /></div>
        <div><label className={lbl}>Phone *</label><input type="tel" className={inputCls} style={inputStyle} /></div>
        <div><label className={lbl}>Email</label><input type="email" className={inputCls} style={inputStyle} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={lbl}>Date *</label><input type="date" className={inputCls} style={inputStyle} /></div>
          <div>
            <label className={lbl}>Time *</label>
            <select className={inputCls} style={inputStyle}>
              <option value="">Select a time…</option>
              {TIMES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        {!!services.length && (
          <div>
            {/* Compulsory whenever services are configured. */}
            <label className={lbl}>Service *</label>
            <select className={inputCls} style={inputStyle}>
              <option value="">Select a service…</option>
              {services.map((s, i) => <option key={i}>{s}</option>)}
            </select>
          </div>
        )}
        <div><label className={lbl}>Message</label><textarea rows={3} className={inputCls} style={inputStyle} /></div>
        <button
          type="button"
          className="mt-1 rounded-[var(--radius)] px-4 py-3 text-[15px] font-semibold"
          style={{ background: "var(--color-primary)", color: "var(--color-primary-fg)" }}
        >
          {props.submitText || "Request appointment"}
        </button>
    </form>
  );

  const image = img ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img}
      alt={props.heading ?? "Appointment"}
      loading="lazy"
      className="w-full"
      style={{ borderRadius: "var(--radius)", maxHeight: 520, ...imageFitStyle(props.imageFit, "var(--radius)") }}
    />
  ) : null;

  return (
    <SectionShell section={section}>
      <SectionHeader label={props.label} heading={props.heading} sub={props.sub} light={light} />
      {split ? (
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2" style={{ textAlign: "left" }}>
          {section.variant === "image-left" ? (
            <>{image}<div>{form}</div></>
          ) : (
            <><div>{form}</div>{image}</>
          )}
        </div>
      ) : (
        form
      )}
    </SectionShell>
  );
}
