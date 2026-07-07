/**
 * Maps branding (accent + theme tokens + font preset) onto the CSS custom
 * properties consumed by globals.css. Shared between the server RootLayout and
 * the client-side live preview so both stay in sync.
 */

import { resolveFontPreset } from "./fonts";
import type { InstanceBranding, ThemeTokens } from "./types";

export type ResolvedTheme = "light" | "dark";

/** The `--color-*-raw` variables for one light/dark token set. */
export function themeTokensToVars(t: ThemeTokens): Record<string, string> {
  return {
    "--color-bg-base-raw": t.bgBase,
    "--color-bg-mesh-1-raw": t.bgMesh1,
    "--color-bg-mesh-2-raw": t.bgMesh2,
    "--color-bg-mesh-3-raw": t.bgMesh3,
    "--color-text-raw": t.text,
    "--color-text-soft-raw": t.textSoft,
    "--color-muted-raw": t.muted,
    "--color-success-raw": t.success,
    "--color-warning-raw": t.warning,
    "--color-danger-raw": t.danger,
    "--color-green-raw": t.green,
    "--color-tip-raw": t.tip,
  };
}

/**
 * Full set of CSS variables for a branding at a given resolved theme.
 * `--color-accent-soft-raw` is derived from the accent so custom accents keep
 * a matching soft tint.
 */
export function brandingToCssVars(
  branding: InstanceBranding,
  resolved: ResolvedTheme
): Record<string, string> {
  const tokens = branding.theme[resolved];
  const preset = resolveFontPreset(branding.fontPreset);
  const softPct = resolved === "dark" ? "24%" : "16%";
  return {
    ...themeTokensToVars(tokens),
    "--color-accent-raw": branding.accent,
    "--color-accent-soft-raw": `color-mix(in srgb, ${branding.accent} ${softPct}, transparent)`,
    "--font-sans": preset.sans,
    "--font-display": preset.display,
  };
}

function varsToBlock(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `${k}:${v};`)
    .join("");
}

/**
 * CSS injected once in the document head so branding overrides globals.css for
 * BOTH themes. Using `[data-theme]` selectors (not inline styles) keeps the
 * client-side light/dark toggle working. `html`-prefixed selectors raise
 * specificity so this always wins over the stylesheet defaults.
 */
export function brandingThemeCss(branding: InstanceBranding): string {
  const preset = resolveFontPreset(branding.fontPreset);
  const root = varsToBlock({
    "--color-accent-raw": branding.accent,
    "--font-sans": preset.sans,
    "--font-display": preset.display,
  });
  const light = varsToBlock({
    ...themeTokensToVars(branding.theme.light),
    "--color-accent-soft-raw": `color-mix(in srgb, ${branding.accent} 16%, transparent)`,
  });
  const dark = varsToBlock({
    ...themeTokensToVars(branding.theme.dark),
    "--color-accent-soft-raw": `color-mix(in srgb, ${branding.accent} 24%, transparent)`,
  });
  return [
    `html{${root}}`,
    `html,html[data-theme="light"]{${light}}`,
    `html[data-theme="dark"]{${dark}}`,
  ].join("");
}
