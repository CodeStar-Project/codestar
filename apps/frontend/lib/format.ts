import type { CourseLevel, CourseStatus } from "./types";

export function parseProgress(progress: string | number): number {
  const n = typeof progress === "string" ? parseFloat(progress) : progress;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export function formatPercent(progress: string | number): string {
  return `${Math.round(parseProgress(progress) * 100)}%`;
}

export function formatDate(iso: string | null | undefined, locale = "fr"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

export function relativeDays(iso: string | null | undefined): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

export const LEVEL_LABELS: Record<CourseLevel, { fr: string; en: string }> = {
  BEGINNER: { fr: "Débutant", en: "Beginner" },
  INTERMEDIATE: { fr: "Intermédiaire", en: "Intermediate" },
  ADVANCED: { fr: "Avancé", en: "Advanced" },
};

export const STATUS_LABELS: Record<CourseStatus, { fr: string; en: string }> = {
  DRAFT: { fr: "Brouillon", en: "Draft" },
  PUBLISHED: { fr: "Publié", en: "Published" },
  ARCHIVED: { fr: "Archivé", en: "Archived" },
};

export function levelLabel(level: CourseLevel | null | undefined, locale: "fr" | "en" = "fr"): string {
  if (!level) return "";
  return LEVEL_LABELS[level]?.[locale] ?? level;
}

export function statusLabel(status: CourseStatus | null | undefined, locale: "fr" | "en" = "fr"): string {
  if (!status) return "";
  return STATUS_LABELS[status]?.[locale] ?? status;
}
