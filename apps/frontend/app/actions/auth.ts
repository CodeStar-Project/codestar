"use server";

/**
 * Auth server actions
*/

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

import { ApiError, apiFetch, authCookieName } from "@/lib/api";
import type { LoginResponse, MeResponse } from "@/lib/types";

interface AuthActionResult {
  ok: boolean;
  error?: string;
  expired?: boolean;
}

interface SignInInput {
  email: string;
  password: string;
}

interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
  invitationCode?: string;
}

interface JoinGroupInput {
  code: string;
}

const COOKIE_OPTS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

async function setAuthCookie(token: string) {
  const store = await cookies();
  store.set(authCookieName(), token, COOKIE_OPTS);
}

export async function signInAction(input: SignInInput): Promise<AuthActionResult> {
  const t = await getTranslations("login.errors");
  try {
    const data = await apiFetch<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: input,
      withAuth: false,
    });
    if (!data?.accessToken) return { ok: false, error: t("backendInvalid") };
    await setAuthCookie(data.accessToken);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e, t) };
  }
}

export async function signUpAction(input: SignUpInput): Promise<AuthActionResult> {
  const t = await getTranslations("login.errors");
  try {
    const data = await apiFetch<LoginResponse>("/api/v1/auth/register", {
      method: "POST",
      body: input,
      withAuth: false,
    });
    if (!data?.accessToken) return { ok: false, error: t("backendInvalid") };
    await setAuthCookie(data.accessToken);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errorMessage(e, t) };
  }
}

export async function joinGroupAction(input: JoinGroupInput): Promise<AuthActionResult> {
  const t = await getTranslations("login.errors");
  try {
    await apiFetch("/api/v1/groups/join", {
      method: "POST",
      body: { code: input.code },
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      return { ok: false, expired: true, error: e.message };
    }
    return { ok: false, error: errorMessage(e, t) };
  }
}

export async function signOutAction(): Promise<AuthActionResult> {
  const store = await cookies();
  const hasToken = !!store.get(authCookieName());

  if (hasToken) {
    try {
      await apiFetch("/api/v1/auth/logout", { method: "POST" });
    } catch {
      /* logout backend stateless / ignore failure */
    }
  }

  store.delete(authCookieName());
  revalidatePath("/", "layout");
  return { ok: true };
}


export async function getMe(): Promise<MeResponse | null> {
  const store = await cookies();
  if (!store.get(authCookieName())) return null;

  try {
    return await apiFetch<MeResponse>("/api/v1/auth/me", { method: "GET" });
  } catch {
    // 401
    return null;
  }
}

function errorMessage(
  e: unknown,
  t: (key: "network" | "unknown" | "backendInvalid") => string
): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return t("network");
}
