import "server-only";

/**
 * Fetch courses.
 */

import { apiFetch } from "@/lib/api";
import type { Course } from "@/lib/types";

export async function getCourses(): Promise<Course[]> {
  try {
    const data = await apiFetch<Course[]>("/api/v1/courses", {
      method: "GET",
    });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getCourseById(id: number): Promise<Course | null> {
  try {
    const data = await apiFetch<Course>(`/api/v1/courses/${id}`, {
      method: "GET",
    });
    return data ?? null;
  } catch {
    return null;
  }
}
