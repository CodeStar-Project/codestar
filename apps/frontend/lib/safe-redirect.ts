/**
 * Falls back to "/" on anything suspicious.
 */
export function sanitizeNextPath(
  value: string | undefined | null,
  fallback = "/"
): string {
  if (!value || typeof value !== "string") return fallback;
  if (value.length > 2048) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/[\x00-\x1F\x7F]/.test(value)) return fallback;
  return value;
}
