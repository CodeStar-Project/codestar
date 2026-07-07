/**
 * Font preset registry.
 *
 * Each preset maps to a {sans, display} pair of CSS variables that are loaded
 * by the RootLayout via next/font. Applying a preset overrides the global
 * `--font-sans` / `--font-display` tokens consumed across the app.
 */

export interface FontPreset {
  id: string;
  label: string;
  /** CSS value for --font-sans (body). */
  sans: string;
  /** CSS value for --font-display (headings). */
  display: string;
}

const SANS_FALLBACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const SERIF_FALLBACK = "Georgia, serif";

export const FONT_PRESETS: FontPreset[] = [
  {
    id: "outfit-instrument",
    label: "Outfit · Instrument Serif",
    sans: `var(--font-outfit), ${SANS_FALLBACK}`,
    display: `var(--font-instrument), ${SERIF_FALLBACK}`,
  },
  {
    id: "inter-fraunces",
    label: "Inter · Fraunces",
    sans: `var(--font-inter), ${SANS_FALLBACK}`,
    display: `var(--font-fraunces), ${SERIF_FALLBACK}`,
  },
  {
    id: "inter-instrument",
    label: "Inter · Instrument Serif",
    sans: `var(--font-inter), ${SANS_FALLBACK}`,
    display: `var(--font-instrument), ${SERIF_FALLBACK}`,
  },
  {
    id: "outfit-fraunces",
    label: "Outfit · Fraunces",
    sans: `var(--font-outfit), ${SANS_FALLBACK}`,
    display: `var(--font-fraunces), ${SERIF_FALLBACK}`,
  },
];

export const DEFAULT_FONT_PRESET = FONT_PRESETS[1]; // inter-fraunces (current look)

export function resolveFontPreset(id: string | null | undefined): FontPreset {
  return FONT_PRESETS.find((p) => p.id === id) ?? DEFAULT_FONT_PRESET;
}
