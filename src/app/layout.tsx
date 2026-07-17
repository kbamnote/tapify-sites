import type { ReactNode } from "react";
import "./globals.css";

/**
 * Root layout is intentionally bare.
 *
 * Every customer site carries its OWN theme (colours + fonts), so <html>/<body>
 * must not impose one. The per-site theme is applied as CSS variables inside the
 * page, and per-page <title>/SEO comes from generateMetadata in [[...slug]].
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body
        className="min-h-full"
        style={{
          margin: 0,
          background: "var(--color-bg, #ffffff)",
          color: "var(--color-text, #111827)",
          fontFamily: "var(--font-body, system-ui, sans-serif)",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {children}
      </body>
    </html>
  );
}
