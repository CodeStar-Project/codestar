/**
 * Static fallback for the instance branding.
*/

import type { InstanceBranding } from "./types";

export const DEFAULT_INSTANCE: InstanceBranding = {
  name: "Codestar",
  tagline: "Open-source e-learning platform",
  logo: { kind: "preset", value: "star" },
  accent: "#EAB12E",
  heroTitle: null,
  heroSubtitle: null,
  heroCta: null,
  locale: "en",
};
