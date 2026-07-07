"use server";

/**
 * Platform settings — backed by GET/PATCH /api/v1/settings (Admin+).
 */

import { ApiError, apiFetch } from "@/lib/api";
import type { InstanceSettings, UpdateSettingsPayload } from "@/lib/types";

export async function getSettings(): Promise<InstanceSettings | null> {
  try {
    return (await apiFetch<InstanceSettings>("/api/v1/settings")) ?? null;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return null;
    throw e;
  }
}

export async function updateSettings(
  payload: UpdateSettingsPayload
): Promise<{ ok: boolean; error?: string; data?: InstanceSettings }> {
  try {
    const data = await apiFetch<InstanceSettings>("/api/v1/settings", {
      method: "PATCH",
      body: payload,
    });
    return { ok: true, data: data ?? undefined };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, error: e.message };
    if (e instanceof Error) return { ok: false, error: e.message };
    return { ok: false, error: undefined };
  }
}
