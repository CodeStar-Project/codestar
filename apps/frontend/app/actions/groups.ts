import "server-only";

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
