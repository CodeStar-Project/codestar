import "server-only";

import { ApiError, apiFetch } from "@/lib/api";
import type { Enrollment } from "@/lib/types";

export async function getMyEnrollments(): Promise<Enrollment[]> {
  try {
    return (await apiFetch<Enrollment[]>("/api/v1/enrollments/mine")) ?? [];
  } catch {
    return [];
  }
}

export async function updateProgress(
  courseId: string,
  progress: number,
  lastBlockId?: string
): Promise<{ ok: boolean; error?: string; enrollment?: Enrollment }> {
  try {
    const data = await apiFetch<Enrollment>(
      `/api/v1/enrollments/${courseId}/progress`,
      {
        method: "POST",
        body: { progress: progress.toFixed(2), lastBlockId },
      }
    );
    return { ok: true, enrollment: data ?? undefined };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message : "Erreur" };
  }
}
