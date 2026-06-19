import "server-only";

/**
 * HTTP Client server-side to backend.
 */

import { cookies } from "next/headers";
import { decodeJwt } from "jose";

import { logger } from "./logger";
import type { ApiResponse } from "./types";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable : ${name}`);
  }
  return value;
}

let _apiUrl: string | undefined;
function apiUrl(): string {
  return (_apiUrl ??= requireEnv("API_URL").replace(/\/+$/, ""));
}

export function backendBaseUrl(): string {
  return apiUrl();
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

function actorIdFromToken(token: string | undefined): string | undefined {
  if (!token) return undefined;
  try {
    const sub = decodeJwt(token).sub;
    return typeof sub === "string" ? sub : undefined;
  } catch {
    return undefined;
  }
}

function logRequestFailure(method: string, path: string, status: number, token?: string) {
  const route = path.split("?")[0];
  const actorId = actorIdFromToken(token);
  if (status >= 500) logger.error("api", "upstream server error", { method, route, status, actorId });
  else if (status === 0) logger.warn("api", "network error", { method, route, actorId });
  else if (status === 408) logger.warn("api", "request timeout", { method, route, actorId });
  else if (status === 400 || status === 422) logger.debug("api", "bad request", { method, route, status, actorId });
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

  let token: string | undefined;
  if (withAuth) {
    const cookieStore = await cookies();
    token = cookieStore.get(authCookieName())?.value;
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(),
    timeoutMs
  );

  const signal = rest.signal ? AbortSignal.any([rest.signal, timeoutController.signal]) : timeoutController.signal;

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
    const method = rest.method ?? "GET";
    if (err instanceof Error && err.name === "AbortError") {
      logRequestFailure(method, path, 408, token);
      throw new ApiError(408, "Request timeout");
    }
    logRequestFailure(method, path, 0, token);
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
    logRequestFailure(rest.method ?? "GET", path, res.status, token);
    throw new ApiError(res.status, parsed?.message ?? `HTTP error ${res.status}`);
  }

  if (!parsed) {
    return undefined as T;
  }

  return parsed.data as T;
}

/**
 * Multipart upload (FormData)
 */
export async function apiUpload<T>(path: string, formData: FormData, timeoutMs = 30_000): Promise<T | undefined> {
  const finalHeaders = new Headers();
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName())?.value;
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${apiUrl()}${path}`, {
      method: "POST",
      headers: finalHeaders,
      body: formData,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      logRequestFailure("POST", path, 408, token);
      throw new ApiError(408, "Request timeout");
    }
    logRequestFailure("POST", path, 0, token);
    throw new ApiError(0, "Network error");
  } finally {
    clearTimeout(timeoutId);
  }

  const isJson = (res.headers.get("content-type") ?? "").includes("application/json");
  let parsed: ApiResponse<T> | null = null;

  if (isJson) {
    try {
      parsed = (await res.json()) as ApiResponse<T>;
    } catch {
      /* malformed JSON */
    }
  }

  if (!res.ok) {
    logRequestFailure("POST", path, res.status, token);
    throw new ApiError(res.status, parsed?.message ?? `HTTP error ${res.status}`);
  }

  return parsed?.data as T;
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
  let token: string | undefined;
  if (withAuth) {
    const cookieStore = await cookies();
    token = cookieStore.get(authCookieName())?.value;
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
    const method = rest.method ?? "GET";
    if (err instanceof Error && err.name === "AbortError") {
      logRequestFailure(method, path, 408, token);
      throw new ApiError(408, "Request timeout");
    }
    logRequestFailure(method, path, 0, token);
    throw new ApiError(0, "Network error");
  } finally {
    clearTimeout(timeoutId);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();

  if (!res.ok) {
    logRequestFailure(rest.method ?? "GET", path, res.status, token);
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
