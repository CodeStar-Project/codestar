"use server";

import { ApiError, apiFetch } from "@/lib/api";
import type { CourseBlockKind, CourseLevel } from "@/lib/types";
import { importCourse } from "./courses";

export interface GenerateRequest {
  topic: string;
  level: CourseLevel;
  language: "fr" | "en";
  keyIdeas?: string[];
}

export interface AiDraftBlock {
  kind: CourseBlockKind;
  payload: Record<string, unknown>;
}

export interface AiDraftPage {
  title: string;
  blocks: AiDraftBlock[];
}

export interface AiCourseDraft {
  course: {
    title: string;
    slug: string;
    description: string;
    category: string;
    level: CourseLevel;
  };
  pages: AiDraftPage[];
}

export type GenerateErrorCode =
  | "empty"
  | "rateLimited"
  | "unavailable"
  | "invalidResponse"
  | "failed"
  | "unexpected";

export type GenerateResult =
  | { ok: true; draft: AiCourseDraft }
  | { ok: false; error: GenerateErrorCode };

export async function generateAiCourse(request: GenerateRequest): Promise<GenerateResult> {
  try {
    const draft = await apiFetch<AiCourseDraft>("/api/v1/ai/courses/generate", {
      method: "POST",
      body: request,
      timeoutMs: 120_000,
    });
    if (!draft) return { ok: false, error: "empty" };
    return { ok: true, draft };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 429) return { ok: false, error: "rateLimited" };
      if (e.status === 503) return { ok: false, error: "unavailable" };
      if (e.status === 502) return { ok: false, error: "invalidResponse" };
      return { ok: false, error: "failed" };
    }
    return { ok: false, error: "unexpected" };
  }
}

export async function importAiCourse(draft: AiCourseDraft) {
  return importCourse({
    version: 2,
    course: draft.course,
    pages: draft.pages,
  });
}
