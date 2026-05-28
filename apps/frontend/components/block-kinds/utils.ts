import type { BlockPayload } from "./types";

export function getStr(payload: BlockPayload, key: string): string {
  const v = payload[key];
  return typeof v === "string" ? v : "";
}

export function safeUrl(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
  } catch {
    return "";
  }
  return "";
}

export function stripPrivateKeys(payload: BlockPayload): BlockPayload {
  const out: BlockPayload = {};
  for (const [k, v] of Object.entries(payload)) {
    if (k.startsWith("_")) continue;
    out[k] = v;
  }
  return out;
}
