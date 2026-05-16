/**
 * Static fallback for the instance branding.
*/

import type { InstanceBranding } from "./types";

export const DEFAULT_INSTANCE: InstanceBranding = {
  name: "Codestar",
  tagline: "Open-source e-learning platform",
  logo: { kind: "preset", value: "star" },
  accent: "#7AA9FF",
  heroTitle: null,
  heroSubtitle: null,
  heroCta: null,
  locale: "en",
};
