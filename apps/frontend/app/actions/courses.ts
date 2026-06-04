"use server";

import { ApiError, apiFetch } from "@/lib/api";
import type {
  Course,
  CourseExport,
  CourseMutationResult,
  CoursePage,
  CourseStatus,
  CourseSummary,
  CreateCoursePayload,
  PageInput,
  UpdateCoursePayload,
} from "@/lib/types";


export interface CourseFilters {
  status?: string;
  category?: string;
  level?: string;
  author?: string;
  q?: string;
}

function buildFilterQuery(filters: CourseFilters | undefined, all: boolean): string {
  const p = new URLSearchParams();
  if (all) p.set("all", "true");
  if (filters?.status) p.set("status", filters.status);
  if (filters?.category) p.set("category", filters.category);
  if (filters?.level) p.set("level", filters.level);
  if (filters?.author) p.set("author", filters.author);
  if (filters?.q) p.set("q", filters.q);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export async function getPublishedCourses(filters?: CourseFilters): Promise<CourseSummary[]> {
  return (await apiFetch<CourseSummary[]>(`/api/v1/courses${buildFilterQuery(filters, false)}`)) ?? [];
}

export async function getAllCourses(filters?: CourseFilters): Promise<CourseSummary[]> {
  return (await apiFetch<CourseSummary[]>(`/api/v1/courses${buildFilterQuery(filters, true)}`)) ?? [];
}

export async function getMyAuthoredCourses(): Promise<CourseSummary[]> {
  return (await apiFetch<CourseSummary[]>("/api/v1/courses/mine")) ?? [];
}

/**
 * 404/403 = legitimate "not visible" → null (caller calls notFound()).
 * Other errors propagate to the route error boundary.
 */
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  try {
    return (await apiFetch<Course>(`/api/v1/courses/${slug}`)) ?? null;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 403))
      return null;
    throw e;
  }
}

export async function getCoursePages(courseId: string): Promise<CoursePage[]> {
  return (await apiFetch<CoursePage[]>(`/api/v1/courses/${courseId}/pages`)) ?? [];
}

export async function saveCoursePages(courseId: string, pages: PageInput[]): Promise<{ ok: boolean; error?: string; pages?: CoursePage[] }> {
  try {
    const data = await apiFetch<CoursePage[]>(`/api/v1/courses/${courseId}/pages`,
      {
        method: "PUT",
        body: { pages },
      }
    );
    return { ok: true, pages: data ?? [] };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function exportCourse(id: string): Promise<{ ok: boolean; error?: string; data?: CourseExport }> {
  try {
    const data = await apiFetch<CourseExport>(`/api/v1/courses/${id}/export`);
    return { ok: true, data: data ?? undefined };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function importCourse(payload: CourseExport): Promise<CourseMutationResult> {
  try {
    const course = await apiFetch<Course>("/api/v1/courses/import", {
      method: "POST",
      body: payload,
    });
    return { ok: true, course: course ?? undefined };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function createCourse(payload: CreateCoursePayload): Promise<CourseMutationResult> {
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

export async function updateCourse(id: string, payload: UpdateCoursePayload): Promise<CourseMutationResult> {
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

export async function changeCourseStatus(id: string, status: CourseStatus): Promise<CourseMutationResult> {
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

export async function deleteCourse(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiFetch<void>(`/api/v1/courses/${id}`, { method: "DELETE" });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function duplicateCourse(id: string): Promise<{ ok: boolean; error?: string; course?: Course }> {
  try {
    const course = await apiFetch<Course>(`/api/v1/courses/${id}/duplicate`, {
      method: "POST",
    });
    return { ok: true, course: course ?? undefined };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

function errMsg(e: unknown): string | undefined {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return undefined;
}
