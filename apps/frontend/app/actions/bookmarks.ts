"use server";

import { ApiError, apiFetch } from "@/lib/api";
import type { BookmarkEnriched } from "@/lib/types";

interface BookmarkResponse {
  id: string;
  userId: string;
  courseId: string;
  blockId: string;
  createdAt: string;
}

export async function getMyBookmarks(): Promise<BookmarkEnriched[]> {
  return (await apiFetch<BookmarkEnriched[]>("/api/v1/bookmarks/mine")) ?? [];
}

export async function getCourseBookmarks(courseId: string): Promise<BookmarkEnriched[]> {
  return (
    (await apiFetch<BookmarkEnriched[]>(
      `/api/v1/bookmarks?courseId=${encodeURIComponent(courseId)}`
    )) ?? []
  );
}

export async function createBookmark(courseId: string, blockId: string): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const data = await apiFetch<BookmarkResponse>("/api/v1/bookmarks", {
      method: "POST",
      body: { courseId, blockId },
    });
    return { ok: true, id: data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message : undefined };
  }
}

export async function deleteBookmark(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiFetch<void>(`/api/v1/bookmarks/${id}`, { method: "DELETE" });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof ApiError ? e.message : undefined };
  }
}
