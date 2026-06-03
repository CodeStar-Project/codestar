import type { BlockPayload } from "./types";

export function getStr(payload: BlockPayload, key: string): string {
  const v = payload[key];
  return typeof v === "string" ? v : "";
}

export function getNum(payload: BlockPayload, key: string): number | null {
  const v = payload[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function getBool(payload: BlockPayload, key: string): boolean {
  return payload[key] === true;
}

export function getStrArray(payload: BlockPayload, key: string): string[] {
  const v = payload[key];
  return Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x : String(x))) : [];
}

/** Rectangular string matrix from payload (table rows). */
export function getMatrix(payload: BlockPayload, key: string): string[][] {
  const v = payload[key];
  if (!Array.isArray(v)) return [];
  return v.map((row) =>
    Array.isArray(row) ? row.map((c) => (typeof c === "string" ? c : String(c))) : []
  );
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
