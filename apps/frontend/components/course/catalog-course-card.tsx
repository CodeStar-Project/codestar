"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { CourseMeta } from "@/components/course/course-meta";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { CourseSummary } from "@/lib/types";

/** Citron-aligned accent tokens used to give each cover a distinct hue. */
const COVER_TOKENS = [
  "--color-accent",
  "--color-success",
  "--color-warning",
  "--color-danger",
  "--color-tip",
  "--color-green",
] as const;

/** Stable hash so a course always gets the same cover. */
function pickToken(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COVER_TOKENS[h % COVER_TOKENS.length];
}

function initial(title: string): string {
  const m = title.match(/\p{L}|\p{N}/u);
  return (m?.[0] ?? "•").toUpperCase();
}

export function CatalogCourseCard({
  course,
  locale = "fr",
}: {
  course: CourseSummary;
  locale?: "fr" | "en";
}) {
  const t = useTranslations("catalog");
  const token = pickToken(course.slug || course.id);

  return (
    <Link
      href={`/courses/${course.slug}`}
      aria-label={course.title}
      className="group block h-full focus-visible:outline-none"
    >
      <GlassCard variant="default" interactive className="h-full overflow-hidden p-0">
        {/* Cover */}
        <div
          className="relative flex h-24 items-center justify-center"
          style={{
            background: `linear-gradient(135deg, color-mix(in oklab, var(${token}) 34%, transparent), color-mix(in oklab, var(${token}) 6%, transparent))`,
          }}
        >
          <span
            aria-hidden
            className="font-display text-[3.2rem] leading-none opacity-55"
            style={{ color: `var(${token})` }}
          >
            {initial(course.title)}
          </span>
        </div>

        {/* Body */}
        <div className="flex h-[calc(100%-6rem)] flex-col gap-3 p-5">
          <CourseMeta
            category={course.category}
            level={course.level}
            locale={locale}
          />

          <h3 className="font-display text-[1.18rem] leading-snug tracking-tight text-text">
            {course.title}
          </h3>

          {course.description && (
            <p className="line-clamp-2 text-[0.9rem] leading-[1.55] text-text-soft">
              {course.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-[color:var(--glass-border)] pt-3">
            <span className="truncate text-[0.78rem] text-muted">
              {course.authorName ? t("by", { author: course.authorName }) : " "}
            </span>
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)] transition-transform group-hover:translate-x-0.5"
            >
              <ArrowRightIcon size={15} />
            </span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
