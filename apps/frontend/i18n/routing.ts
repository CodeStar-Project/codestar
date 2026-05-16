/**
 * Add new language codes to `LOCALES` and create the corresponding `messages/[code].json`.
 */

export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "codestar_lang";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
