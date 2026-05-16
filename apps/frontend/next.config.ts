import path from "node:path";

import dotenv from "dotenv";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// TODO v2: add CSP (tuned source list with nonces) + HSTS.
/**
 * Baseline security headers applied to every response.
 */
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    JWT_SECRET: process.env.JWT_SECRET ?? "",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
