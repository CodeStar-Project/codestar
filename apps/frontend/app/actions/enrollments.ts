"use server";

import { ApiError, apiFetch } from "@/lib/api";
import type { Enrollment } from "@/lib/types";

export async function getMyEnrollments(): Promise<Enrollment[]> {
  return (await apiFetch<Enrollment[]>("/api/v1/enrollments/mine")) ?? [];
}

export async function updateProgress(courseId: string, progress: number, lastBlockId?: string): Promise<{ ok: boolean; error?: string; enrollment?: Enrollment }> {
  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    return { ok: false, error: "Progress must be between 0 and 100" };
  }
  
  try {
    const data = await apiFetch<Enrollment>(`/api/v1/enrollments/${courseId}/progress`,
      {
        method: "POST",
        body: { progress: progress.toFixed(2), lastBlockId },
      }
    );
    return { ok: true, enrollment: data ?? undefined };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message : undefined };
  }
}
