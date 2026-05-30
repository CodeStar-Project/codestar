"use server";

import { ApiError, apiFetch, apiFetchText } from "@/lib/api";
import type { CourseSummary, GroupResponse, GroupSummary } from "@/lib/types";

export async function getMyGroups(): Promise<GroupSummary[]> {
  return (await apiFetch<GroupSummary[]>("/api/v1/groups/mine")) ?? [];
}

export async function getAllGroups(): Promise<GroupResponse[]> {
  return (await apiFetch<GroupResponse[]>("/api/v1/groups")) ?? [];
}

export async function getGroup(id: string): Promise<GroupResponse | null> {
  try {
    return (await apiFetch<GroupResponse>(`/api/v1/groups/${id}`)) ?? null;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 403))
      return null;
    throw e;
  }
}

export async function getCurriculum(groupId: string): Promise<CourseSummary[]> {
  return (
    (await apiFetch<CourseSummary[]>(`/api/v1/groups/${groupId}/curriculum`)) ?? []
  );
}

export async function replaceCurriculum(
  groupId: string,
  courseIds: string[]
): Promise<{ ok: boolean; error?: string; courses?: CourseSummary[] }> {
  try {
    const data = await apiFetch<CourseSummary[]>(
      `/api/v1/groups/${groupId}/curriculum`,
      {
        method: "PUT",
        body: { courseIds },
      }
    );
    return { ok: true, courses: data ?? [] };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message : undefined };
  }
}

export interface GroupMember {
  userId: string;
  email: string;
  displayName: string;
  globalRole: string;
  roleInGroup: "STUDENT" | "TEACHER";
  joinedAt: string;
  disabledAt: string | null;
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  return (await apiFetch<GroupMember[]>(`/api/v1/groups/${groupId}/members`)) ?? [];
}

export async function removeGroupMember(
  groupId: string,
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiFetch<void>(`/api/v1/groups/${groupId}/members/${userId}`, {
      method: "DELETE",
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message : undefined };
  }
}

export async function updateGroupMemberRole(
  groupId: string,
  userId: string,
  roleInGroup: "STUDENT" | "TEACHER"
): Promise<{ ok: boolean; error?: string; member?: GroupMember }> {
  try {
    const m = await apiFetch<GroupMember>(
      `/api/v1/groups/${groupId}/members/${userId}`,
      {
        method: "PATCH",
        body: { roleInGroup },
      }
    );
    return { ok: true, member: m ?? undefined };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message : undefined };
  }
}

export async function deleteGroup(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiFetch<void>(`/api/v1/groups/${id}`, { method: "DELETE" });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message : undefined };
  }
}

export async function exportGroupStatsCsv(
  id: string
): Promise<{ ok: boolean; error?: string; csv?: string }> {
  try {
    const csv = await apiFetchText(`/api/v1/groups/${id}/stats/export.csv`);
    return { ok: true, csv };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message : undefined };
  }
}

export interface Invitation {
  id: string;
  code: string;
  groupId: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export async function getInvitations(
  groupId: string,
  includeRevoked = false
): Promise<Invitation[]> {
  const qs = includeRevoked ? "?includeRevoked=true" : "";
  return (
    (await apiFetch<Invitation[]>(`/api/v1/groups/${groupId}/invitations${qs}`)) ?? []
  );
}
