import "server-only";

/**
 * HTTP Client server-side to backend.
 */

import { cookies } from "next/headers";

import type { ApiResponse } from "./types";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable : ${name}`);
  }
  return value;
}

// Lazy memoized so the module can be imported during `next build`'s page-data
// collection without crashing when env vars aren't set at build time. Throws
// only on first actual use (request time).
let _apiUrl: string | undefined;
function apiUrl(): string {
  return (_apiUrl ??= requireEnv("API_URL").replace(/\/+$/, ""));
}

let _authCookieName: string | undefined;
export function authCookieName(): string {
  return (_authCookieName ??= requireEnv("AUTH_COOKIE_NAME"));
}

const DEFAULT_TIMEOUT_MS = 10_000;

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  withAuth?: boolean;
  timeoutMs?: number;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  {
    body,
    withAuth = true,
    headers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    ...rest
  }: ApiFetchOptions = {}
): Promise<T | undefined> {
  const finalHeaders = new Headers(headers);
  if (body !== undefined && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (withAuth) {
    const cookieStore = await cookies();
    const token = cookieStore.get(authCookieName())?.value;
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(),
    timeoutMs
  );

  const signal = rest.signal
    ? AbortSignal.any([rest.signal, timeoutController.signal])
    : timeoutController.signal;

  let res: Response;
  try {
    const authDefault: RequestInit = withAuth ? { cache: "no-store" } : {};
    res = await fetch(`${apiUrl()}${path}`, {
      ...authDefault,
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(408, "Request timeout");
    }
    throw new ApiError(0, "Network error");
  } finally {
    clearTimeout(timeoutId);
  }

  const isNoContent =
    res.status === 204 || res.headers.get("content-length") === "0";
  const isJson = (res.headers.get("content-type") ?? "").includes(
    "application/json"
  );

  let parsed: ApiResponse<T> | null = null;
  if (!isNoContent && isJson) {
    try {
      parsed = (await res.json()) as ApiResponse<T>;
    } catch {
      /* malformed JSON body */
    }
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      parsed?.message ?? `HTTP error ${res.status}`
    );
  }

  if (!parsed) {
    return undefined as T;
  }

  return parsed.data as T;
}

/**
 * Raw text fetch (no ApiResponse unwrap). For non-JSON endpoints (CSV, etc.).
 */
export async function apiFetchText(
  path: string,
  { withAuth = true, timeoutMs = DEFAULT_TIMEOUT_MS, ...rest }: {
    withAuth?: boolean;
    timeoutMs?: number;
  } & RequestInit = {}
): Promise<string> {
  const finalHeaders = new Headers(rest.headers);
  if (withAuth) {
    const cookieStore = await cookies();
    const token = cookieStore.get(authCookieName())?.value;
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  const signal = rest.signal
    ? AbortSignal.any([rest.signal, timeoutController.signal])
    : timeoutController.signal;

  let res: Response;
  try {
    const authDefault: RequestInit = withAuth ? { cache: "no-store"} : {};
    res = await fetch(`${apiUrl()}${path}`, {
      ...authDefault,
      ...rest,
      headers: finalHeaders,
      signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(408, "Request timeout");
    }
    throw new ApiError(0, "Network error");
  } finally {
    clearTimeout(timeoutId);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();

  if (!res.ok) {
    let message = `HTTP error ${res.status}`;
    if (text.trim()) {
      if (contentType.includes("application/json")) {
        try {
          message =
            (JSON.parse(text) as { message?: string }).message ?? message;
        } catch {
          message = text;
        }
      } else {
        message = text;
      }
    }

    throw new ApiError(res.status, message);
  }

  return text;
}
