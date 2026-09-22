import type { NextConfig } from "next";
import { portalRedirects } from "./lib/navigation";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://search.dip.bundestag.de https://akademie.wirkungsoekonomie.de",
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const staticPublicExport = process.env.WOEK_STATIC_PUBLIC_EXPORT === "1";

const nextConfig: NextConfig = {
  // A handful of source-heavy programme pages intentionally render tens of
  // megabytes of reviewed local data. They are built once and then served as
  // static files; allow that local/release work to finish without retries.
  staticPageGenerationTimeout: 180,
  ...(staticPublicExport ? {
    output: "export" as const,
    trailingSlash: true,
    images: { unoptimized: true },
  } : {
    async redirects() { return portalRedirects; },
    async headers() {
      return [{ source: "/(.*)", headers: securityHeaders }];
    },
  }),
};

export default nextConfig;
