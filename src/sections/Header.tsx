import type { CSSProperties, ReactNode } from "react";
import type { SectionProps, Link as LinkT } from "@/lib/types";
import { mediaUrl } from "@/lib/api";
import { isDarkBg, CtaButton } from "./_shared";

interface MenuLink { text?: string; href?: string }
interface HeaderProps {
  logo?: string;
  logoSize?: "small" | "medium" | "large" | "extra-large";
  links?: MenuLink[];
  cta?: LinkT;
  showCart?: boolean;
  cartHref?: string;
  showAccount?: boolean;
  accountHref?: string;
  sticky?: boolean;
}

/** Logo heights for the "Logo size" control. */
const LOGO_PX: Record<string, number> = { small: 28, medium: 36, large: 48, "extra-large": 64 };

/** Header background, mirroring _shared's bgStyles (which isn't exported). */
function headerBg(bg: string | undefined): CSSProperties {
  switch (bg) {
    case "surface": return { background: "var(--color-surface)", color: "var(--color-text)" };
    case "primary": return { background: "var(--color-primary)", color: "var(--color-primary-fg)" };
    case "dark":    return { background: "#0F172A", color: "#F8FAFC" };
    case "none":    return {};
    default:        return { background: "var(--color-bg)", color: "var(--color-text)" };
  }
}

export default function Header({ section, props, doc }: SectionProps<HeaderProps>) {
  const variant = section.variant ?? "left";
  const logo = mediaUrl(props.logo);
  const dark = isDarkBg(section.style);

  // Menu source: the customer's own links if they added any, otherwise the
  // site's visible pages in Pages-tab order. This is what makes page order and
  // renaming show up on the live site with no extra wiring.
  const custom = (props.links ?? []).filter((l) => l.text && l.href);
  const items: MenuLink[] = custom.length
    ? custom
    : doc.pages
        .filter((p) => p.visible !== false)
        .map((p) => ({ text: p.title, href: p.slug }));

  // A unique id so multiple headers (or the same header on many pages) don't
  // share one mobile-menu checkbox.
  const toggleId = `nav-${section.id}`;

  // Clicking the logo always returns to the home page.
  const homeHref = doc.pages.find((p) => p.slug === "/")?.slug ?? "/";
  const logoPx = LOGO_PX[props.logoSize ?? "medium"] ?? 36;

  const brand = (
    <a href={homeHref} aria-label={`${doc.site.name} — home`} className="inline-flex items-center no-underline" style={{ color: "inherit" }}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={doc.site.name} className="w-auto object-contain" style={{ height: logoPx }} />
      ) : (
        <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {doc.site.name}
        </span>
      )}
    </a>
  );

  const cartEl = props.showCart ? (
    <a
      href={props.cartHref || "/cart"}
      aria-label="Cart"
      className="relative inline-flex items-center justify-center rounded-md p-2 no-underline"
      style={{ color: "inherit", border: "1px solid rgba(120,120,120,.28)" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {/* On the published page cartScript() fills this in and shows it once the
          cart has something in it. The editor canvas has no cart, so it stays
          hidden — matching what a first-time visitor sees. */}
      <span
        data-tf-cart-count
        className="absolute flex items-center justify-center rounded-full text-[11px] font-bold"
        style={{
          display: "none",
          top: -7, right: -7, minWidth: 19, height: 19, padding: "0 5px",
          background: "var(--color-primary)", color: "var(--color-primary-fg)",
        }}
      >
        0
      </span>
    </a>
  ) : null;

  // Login / Signup button. On the published site the cart is gated behind login
  // (see the auth script in the PHP renderer); in the editor we simply show the
  // button so the designer can see it.
  const accountEl = props.showAccount ? (
    <a
      href={props.accountHref || "/account"}
      className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold no-underline"
      style={{ background: "var(--color-primary)", color: "var(--color-primary-fg)" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
      Login / Signup
    </a>
  ) : null;

  const desktopLinks = (
    <nav className="hidden items-center gap-6 md:flex">
      {items.map((l, i) => (
        <a key={i} href={l.href} className="text-sm font-medium opacity-80 transition-opacity hover:opacity-100">
          {l.text}
        </a>
      ))}
    </nav>
  );

  const ctaEl = props.cta?.text && props.cta.href ? (
    <div className="hidden md:inline-flex">
      <CtaButton link={props.cta} onDark={dark} />
    </div>
  ) : null;

  // Hamburger — a label bound to the checkbox below. Pure CSS, no JavaScript.
  const burger = (
    <label
      htmlFor={toggleId}
      aria-label="Toggle menu"
      className="inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 md:hidden"
      style={{ border: "1px solid currentColor" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </label>
  );

  // Desktop bar layout depends on the variant. Mobile is identical for all three.
  let bar: ReactNode;
  if (variant === "nav-center") {
    // Logo left · menu centered · button/cart right — the common shop layout.
    bar = (
      <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex shrink-0 items-center">{brand}</div>
        <div className="hidden flex-1 justify-center md:flex">{desktopLinks}</div>
        <div className="flex shrink-0 items-center gap-3">
          {ctaEl}
          {accountEl}{cartEl}
          {burger}
        </div>
      </div>
    );
  } else if (variant === "center") {
    bar = (
      <div className="flex flex-col items-center gap-2 py-3">
        <div className="flex w-full items-center justify-between md:justify-center">
          {brand}
          <div className="flex items-center gap-3 md:hidden">
            {accountEl}{cartEl}
            {burger}
          </div>
        </div>
        <div className="hidden w-full items-center justify-center gap-6 md:flex">
          {desktopLinks}
          {ctaEl}
          {accountEl}{cartEl}
        </div>
      </div>
    );
  } else if (variant === "split") {
    bar = (
      <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-4">
          {desktopLinks}
          {burger}
        </div>
        <div className="md:absolute md:left-1/2 md:-translate-x-1/2">{brand}</div>
        <div className="flex items-center gap-3">
          {ctaEl}
          {accountEl}{cartEl}
        </div>
      </div>
    );
  } else {
    // "left" (default): logo left, menu + button right.
    bar = (
      <div className="flex items-center justify-between gap-4 py-3">
        {brand}
        <div className="flex items-center gap-6">
          {desktopLinks}
          {ctaEl}
          {accountEl}{cartEl}
          {burger}
        </div>
      </div>
    );
  }

  return (
    <header
      id={section.id}
      data-section-type={section.type}
      data-section-id={section.id}
      className="relative z-40 w-full"
      style={{
        ...headerBg(section.style?.bg),
        borderBottom: "1px solid rgba(120,120,120,.18)",
        ...(props.sticky !== false ? { position: "sticky", top: 0 } : null),
      }}
    >
      {/* Mobile-menu state. First child of <header> so Tailwind's `peer` can reach
          the dropdown below it. sr-only keeps it accessible but invisible. */}
      <input id={toggleId} type="checkbox" className="peer sr-only" aria-hidden="true" />

      <div className="mx-auto px-5 md:px-8" style={{ maxWidth: "var(--container)" }}>
        {bar}
      </div>

      {/* Mobile dropdown. The open-rule is gated to `max-md` so it can never win
          over the desktop hide — on desktop only the base `hidden` applies, so no
          !important and no specificity fight. */}
      <nav
        className="hidden flex-col gap-1 px-5 pb-3 max-md:peer-checked:flex"
        style={{ borderTop: "1px solid rgba(120,120,120,.18)" }}
      >
        {items.map((l, i) => (
          <a key={i} href={l.href} className="rounded-md px-2 py-2 text-sm font-medium opacity-90 hover:opacity-100" style={{ background: "rgba(120,120,120,.06)" }}>
            {l.text}
          </a>
        ))}
        {props.cta?.text && props.cta.href && (
          <div className="mt-2">
            <CtaButton link={props.cta} onDark={dark} />
          </div>
        )}
      </nav>
    </header>
  );
}
