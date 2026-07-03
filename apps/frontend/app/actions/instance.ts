"use server";

/**
 * Instance branding — backed by GET/PATCH /api/v1/settings/branding.
 * Branding read is public (consumed by the landing before login); writes are Admin+.
 */

import { updateTag } from "next/cache";

import { ApiError, apiFetch } from "@/lib/api";
import { DEFAULT_INSTANCE, DEFAULT_THEME_TOKENS } from "@/lib/instance";
import type { InstanceBranding, UpdateBrandingPayload } from "@/lib/types";

const BRANDING_TAG = "instance-branding";

/** Fill any field the backend might omit so consumers always get a complete object. */
function withDefaults(data: Partial<InstanceBranding> | null): InstanceBranding {
  if (!data) return DEFAULT_INSTANCE;
  return {
    ...DEFAULT_INSTANCE,
    ...data,
    theme: {
      light: { ...DEFAULT_THEME_TOKENS.light, ...data.theme?.light },
      dark: { ...DEFAULT_THEME_TOKENS.dark, ...data.theme?.dark },
    },
  };
}

export async function getInstanceBranding(): Promise<InstanceBranding> {
  try {
    const data = await apiFetch<InstanceBranding>("/api/v1/settings/branding", {
      method: "GET",
      withAuth: false,
      next: { revalidate: 60, tags: [BRANDING_TAG] },
    });
    return withDefaults(data ?? null);
  } catch {
    // Frontend static fallback
    return DEFAULT_INSTANCE;
  }
}

export async function updateBranding(
  payload: UpdateBrandingPayload
): Promise<{ ok: boolean; error?: string; data?: InstanceBranding }> {
  try {
    const data = await apiFetch<InstanceBranding>("/api/v1/settings/branding", {
      method: "PATCH",
      body: payload,
    });
    // Bust the cached public branding fetch so reloads show fresh values
    // (read-your-own-writes within this request and on subsequent reloads).
    updateTag(BRANDING_TAG);
    return { ok: true, data: data ? withDefaults(data) : undefined };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, error: e.message };
    if (e instanceof Error) return { ok: false, error: e.message };
    return { ok: false, error: undefined };
  }
}
