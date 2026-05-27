"use server";

/**
 * Course server actions + fetchers. Callable from server components and client (RPC).
 */

import { ApiError, apiFetch } from "@/lib/api";
import type {
  BlockInput,
  Course,
  CourseBlock,
  CourseMutationResult,
  CourseStatus,
  CourseSummary,
  CreateCoursePayload,
  UpdateCoursePayload,
} from "@/lib/types";

export async function getPublishedCourses(): Promise<CourseSummary[]> {
  try {
    return (await apiFetch<CourseSummary[]>("/api/v1/courses")) ?? [];
  } catch {
    return [];
  }
}

export async function getAllCourses(): Promise<CourseSummary[]> {
  try {
    return (await apiFetch<CourseSummary[]>("/api/v1/courses?all=true")) ?? [];
  } catch {
    return [];
  }
}

export async function getMyAuthoredCourses(): Promise<CourseSummary[]> {
  try {
    return (await apiFetch<CourseSummary[]>("/api/v1/courses/mine")) ?? [];
  } catch {
    return [];
  }
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  try {
    return (await apiFetch<Course>(`/api/v1/courses/${slug}`)) ?? null;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 403))
      return null;
    return null;
  }
}

export async function getCourseBlocks(courseId: string): Promise<CourseBlock[]> {
  try {
    return (
      (await apiFetch<CourseBlock[]>(`/api/v1/courses/${courseId}/blocks`)) ?? []
    );
  } catch {
    return [];
  }
}

export async function saveCourseBlocks(
  courseId: string,
  blocks: BlockInput[]
): Promise<{ ok: boolean; error?: string; blocks?: CourseBlock[] }> {
  try {
    const data = await apiFetch<CourseBlock[]>(
      `/api/v1/courses/${courseId}/blocks`,
      {
        method: "PUT",
        body: { blocks },
      }
    );
    return { ok: true, blocks: data ?? [] };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function createCourse(
  payload: CreateCoursePayload
): Promise<CourseMutationResult> {
  try {
    const course = await apiFetch<Course>("/api/v1/courses", {
      method: "POST",
      body: payload,
    });
    return { ok: true, course: course ?? undefined };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function updateCourse(
  id: string,
  payload: UpdateCoursePayload
): Promise<CourseMutationResult> {
  try {
    const course = await apiFetch<Course>(`/api/v1/courses/${id}`, {
      method: "PATCH",
      body: payload,
    });
    return { ok: true, course: course ?? undefined };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function changeCourseStatus(
  id: string,
  status: CourseStatus
): Promise<CourseMutationResult> {
  try {
    const course = await apiFetch<Course>(`/api/v1/courses/${id}/status`, {
      method: "POST",
      body: { status },
    });
    return { ok: true, course: course ?? undefined };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function deleteCourse(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiFetch<void>(`/api/v1/courses/${id}`, { method: "DELETE" });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

function errMsg(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return "Erreur inconnue";
}
