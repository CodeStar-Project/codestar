import Link from "next/link";

import { CourseMeta } from "@/components/course/course-meta";
import { ProgressBar } from "@/components/course/progress-bar";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import { GlassChip } from "@/components/ui/glass-chip";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import type { CourseSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: CourseSummary;
  href?: string;
  progress?: string | number;
  variant?: "default" | "in-progress" | "completed" | "ghost";
  locale?: "fr" | "en";
  ctaLabel?: string;
  ariaLabel?: string;
  showStatus?: boolean;
  className?: string;
}

export function CourseCard({
  course,
  href,
  progress,
  variant = "default",
  locale = "fr",
  ctaLabel,
  ariaLabel,
  showStatus = false,
  className,
}: CourseCardProps) {
  const cardVariant = variant === "ghost" ? "plain" : "default";
  const link = href ?? `/courses/${course.slug}`;

  const content = (
    <GlassCard
      variant={cardVariant}
      interactive={!!href}
      className={cn("h-full", variant === "completed" && "opacity-90", className)}
    >
      <GlassCardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <CourseMeta
            category={course.category}
            level={course.level}
            status={course.status}
            locale={locale}
            showStatus={showStatus}
          />
          {variant === "completed" && (
            <GlassChip variant="success" size="sm">
              <CheckIcon size={12} />
            </GlassChip>
          )}
        </div>

        <GlassCardTitle as="h3" className="text-[1.15rem]">
          {course.title}
        </GlassCardTitle>

        {course.description && (
          <GlassCardDescription className="text-[0.9rem] line-clamp-2">
            {course.description}
          </GlassCardDescription>
        )}

        {progress !== undefined && variant !== "ghost" && (
          <div className="mt-auto pt-2">
            <ProgressBar progress={progress} size="sm" showLabel />
          </div>
        )}

        {ctaLabel && (
          <div className="mt-auto flex items-center gap-1.5 pt-2 text-[0.88rem] font-medium text-[color:var(--color-accent)]">
            {ctaLabel} <ArrowRightIcon size={14} />
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );

  if (!href) return content;
  return (
    <Link href={link} aria-label={ariaLabel ?? course.title} className="block focus-visible:outline-none">
      {content}
    </Link>
  );
}
