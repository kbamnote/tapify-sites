import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Allow the Tapify dashboard to embed the builder in an <iframe>, so customers
   * edit their website inside their login instead of leaving for a separate site.
   * frame-ancestors (the modern replacement for X-Frame-Options) is scoped to
   * our own domains, so nobody else can frame it. Public customer sites and the
   * builder both share this — it only affects who may embed us, nothing else.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://tapify.co.in https://*.tapify.co.in",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
