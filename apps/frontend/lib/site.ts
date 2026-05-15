/**
 * Public-facing site URL
 */

export const SITE_URL = (process.env.SITE_URL ?? "https://codestar.dev").replace(
  /\/+$/,
  ""
);
