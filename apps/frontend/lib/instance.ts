/**
 * Static fallback for the instance branding.
 * Used when the backend is unreachable; mirrors the "Liquid Glass · Citron"
 * tokens defined in app/globals.css so the fallback matches the real look.
 */

import type { BrandingTheme, InstanceBranding } from "./types";

export const DEFAULT_THEME_TOKENS: BrandingTheme = {
  light: {
    bgBase: "#fbf9ee",
    bgMesh1: "#fff1bf",
    bgMesh2: "#ffe2be",
    bgMesh3: "#ebf6c8",
    text: "#1a1f2e",
    textSoft: "#4a5366",
    muted: "#8892a6",
    success: "#2faa7e",
    warning: "#e08a2b",
    danger: "#e0556a",
    green: "#5aa84a",
    tip: "#d6a01f",
  },
  dark: {
    bgBase: "#0e1422",
    bgMesh1: "#38352a",
    bgMesh2: "#332d26",
    bgMesh3: "#2f3128",
    text: "#edf1f9",
    textSoft: "#b6c0d6",
    muted: "#7c8ba8",
    success: "#5dc9a8",
    warning: "#ffb672",
    danger: "#ff8a95",
    green: "#7bc86c",
    tip: "#ffd66b",
  },
};

export const DEFAULT_INSTANCE: InstanceBranding = {
  name: "Codestar",
  tagline: "Open-source e-learning platform",
  logo: { kind: "preset", value: "star" },
  accent: "#EAB12E",
  heroTitle: null,
  heroSubtitle: null,
  heroCta: null,
  locale: "en",
  favicon: null,
  metaTitle: null,
  metaDescription: null,
  fontPreset: "inter-fraunces",
  theme: DEFAULT_THEME_TOKENS,
};
