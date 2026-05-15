"use server";

/**
 * Change the locale via `LOCALE_COOKIE`.
*/

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { LOCALE_COOKIE, isLocale } from "@/i18n/routing";

export async function setLocaleAction(value: string) {
  if (!isLocale(value)) return;
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    httpOnly: false,
  });
  revalidatePath("/", "layout");
}
