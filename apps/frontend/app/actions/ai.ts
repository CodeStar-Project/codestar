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

export type GenerateResult =
  | { ok: true; draft: AiCourseDraft }
  | { ok: false; error: string };

export async function generateAiCourse(request: GenerateRequest): Promise<GenerateResult> {
  try {
    const draft = await apiFetch<AiCourseDraft>("/api/v1/ai/courses/generate", {
      method: "POST",
      body: request,
      timeoutMs: 120_000,
    });
    if (!draft) return { ok: false, error: "Réponse vide du service IA" };
    return { ok: true, draft };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 429) return { ok: false, error: "Limite de génération atteinte, réessayez dans quelques minutes." };
      if (e.status === 503) return { ok: false, error: "Service IA indisponible, veuillez réessayer." };
      if (e.status === 502) return { ok: false, error: "Le modèle a retourné une réponse invalide, réessayez." };
      return { ok: false, error: e.message };
    }
    return { ok: false, error: "Erreur inattendue lors de la génération." };
  }
}

export async function importAiCourse(draft: AiCourseDraft) {
  return importCourse({
    version: 2,
    course: draft.course,
    pages: draft.pages,
  });
}
