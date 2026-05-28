"use server";

import { ApiError, apiFetch } from "@/lib/api";
import type { CourseSummary, GroupResponse, GroupSummary } from "@/lib/types";

export async function getMyGroups(): Promise<GroupSummary[]> {
  try {
    return (await apiFetch<GroupSummary[]>("/api/v1/groups/mine")) ?? [];
  } catch {
    return [];
  }
}

export async function getAllGroups(): Promise<GroupResponse[]> {
  try {
    return (await apiFetch<GroupResponse[]>("/api/v1/groups")) ?? [];
  } catch {
    return [];
  }
}

export async function getGroup(id: string): Promise<GroupResponse | null> {
  try {
    return (await apiFetch<GroupResponse>(`/api/v1/groups/${id}`)) ?? null;
  } catch {
    return null;
  }
}

export async function getCurriculum(groupId: string): Promise<CourseSummary[]> {
  try {
    return (
      (await apiFetch<CourseSummary[]>(`/api/v1/groups/${groupId}/curriculum`)) ?? []
    );
  } catch {
    return [];
  }
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
    return { ok: false, error: e instanceof ApiError ? e.message : "Erreur" };
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
  try {
    return (await apiFetch<GroupMember[]>(`/api/v1/groups/${groupId}/members`)) ?? [];
  } catch {
    return [];
  }
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
    return { ok: false, error: e instanceof ApiError ? e.message : "Erreur" };
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
    return { ok: false, error: e instanceof ApiError ? e.message : "Erreur" };
  }
}
