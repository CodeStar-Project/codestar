/**
 * Theme tokens shared between server (cookie read in layout) and client toggle.
 * `system` defers to the OS preference, resolved client-side by the inline
 * <ThemeScript> to avoid a flash of the wrong theme.
 */

export const THEME_COOKIE = "codestar_theme";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/** Default when no cookie is present. Design system is "citron-dark". */
export const DEFAULT_THEME: Theme = "dark";

export function isTheme(value: string | undefined | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

/**
 * Server-side resolution. `system` cannot be resolved on the server (the OS
 * preference is unknown), so it falls back to the default resolved theme; the
 * inline script then corrects it on the client before paint.
 */
export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "light" || theme === "dark") return theme;
  return DEFAULT_THEME === "light" ? "light" : "dark";
}
