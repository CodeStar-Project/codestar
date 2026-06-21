"use server";

/**
 * Persist the chosen theme via `THEME_COOKIE` (non-httpOnly so the inline
 * <ThemeScript> can read it). Mirrors `actions/locale.ts`.
 */

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { THEME_COOKIE, isTheme } from "@/lib/theme";

export async function setThemeAction(value: string) {
  if (!isTheme(value)) return;
  const cookieStore = await cookies();
  cookieStore.set(THEME_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    httpOnly: false,
  });
  revalidatePath("/", "layout");
}
