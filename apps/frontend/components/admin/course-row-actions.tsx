"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  changeCourseStatus,
  deleteCourse,
} from "@/app/actions/courses";
import { GlassButton } from "@/components/ui/glass-button";
import {
  ArchiveIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  TrashIcon,
} from "@/components/ui/icons";
import type { CourseStatus, CourseSummary } from "@/lib/types";

interface Labels {
  edit: string;
  publish: string;
  unpublish: string;
  archive: string;
  delete: string;
  confirmDelete: string;
}

interface CourseRowActionsProps {
  course: CourseSummary;
  labels: Labels;
}

export function CourseRowActions({ course, labels }: CourseRowActionsProps) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function statusChange(status: CourseStatus) {
    start(async () => {
      await changeCourseStatus(course.id, status);
      router.refresh();
    });
  }

  function destroy() {
    if (!confirm(labels.confirmDelete)) return;
    start(async () => {
      await deleteCourse(course.id);
      router.refresh();
    });
  }

  const isPublished = course.status === "PUBLISHED";
  const isArchived = course.status === "ARCHIVED";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <GlassButton
        asChild
        variant="ghost"
        size="sm"
        aria-label={`${labels.edit} ${course.title}`}
      >
        <a href={`/admin/courses/${course.id}`}>
          <PencilIcon size={14} />
          <span className="hidden sm:inline">{labels.edit}</span>
        </a>
      </GlassButton>

      {!isArchived && (
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => statusChange(isPublished ? "DRAFT" : "PUBLISHED")}
          disabled={pending}
          aria-label={isPublished ? labels.unpublish : labels.publish}
        >
          {isPublished ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
          <span className="hidden sm:inline">
            {isPublished ? labels.unpublish : labels.publish}
          </span>
        </GlassButton>
      )}

      {!isArchived && (
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => statusChange("ARCHIVED")}
          disabled={pending}
          aria-label={labels.archive}
        >
          <ArchiveIcon size={14} />
          <span className="hidden sm:inline">{labels.archive}</span>
        </GlassButton>
      )}

      <GlassButton
        variant="ghost"
        size="sm"
        onClick={destroy}
        disabled={pending}
        aria-label={labels.delete}
        className="text-[color:var(--color-danger)] hover:text-[color:var(--color-danger)]"
      >
        <TrashIcon size={14} />
      </GlassButton>
    </div>
  );
}
