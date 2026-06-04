"use server";

import { ApiError, apiFetch } from "@/lib/api";
import type { Role } from "@/lib/types";

export interface UserSummary {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt: string;
  disabledAt: string | null;
}

export async function getAllUsers(filters?: {role?: Role; disabled?: boolean; q?: string;}): Promise<UserSummary[]> {
  const params = new URLSearchParams();
  if (filters?.role) params.set("role", filters.role);
  if (filters?.disabled !== undefined) params.set("disabled", String(filters.disabled));
  if (filters?.q) params.set("q", filters.q);
  const qs = params.toString();
  return (await apiFetch<UserSummary[]>(`/api/v1/users${qs ? `?${qs}` : ""}`)) ?? [];
}

export async function updateUserRole(id: string, role: Role): Promise<{ ok: boolean; error?: string; user?: UserSummary }> {
  try {
    const u = await apiFetch<UserSummary>(`/api/v1/users/${id}/role`, {
      method: "PATCH",
      body: { role },
    });
    return { ok: true, user: u ?? undefined };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message : undefined };
  }
}

export async function setUserDisabled(id: string, disabled: boolean): Promise<{ ok: boolean; error?: string; user?: UserSummary }> {
  try {
    const u = await apiFetch<UserSummary>(
      `/api/v1/users/${id}/${disabled ? "disable" : "enable"}`,
      { method: "POST" }
    );
    return { ok: true, user: u ?? undefined };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message : undefined };
  }
}
