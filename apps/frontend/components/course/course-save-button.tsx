"use client";

import { useState, useTransition } from "react";

import { createBookmark, deleteBookmark } from "@/app/actions/bookmarks";
import { GlassButton } from "@/components/ui/glass-button";
import { BookmarkFilledIcon, BookmarkIcon } from "@/components/ui/icons";

interface CourseSaveButtonProps {
  courseId: string;
  /** First block of the course — used as the (hidden) anchor of the course-level bookmark. */
  firstBlockId: string | null;
  initialId: string | null;
  labelSave: string;
  labelSaved: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Course-level "save" toggle. The backend only stores block-level bookmarks,
 * so a saved course is materialised as a single bookmark anchored on its first
 * block. This anchor is invisible to the user: the UI only ever talks about
 * saving the course.
 */
export function CourseSaveButton({
  courseId,
  firstBlockId,
  initialId,
  labelSave,
  labelSaved,
  size = "md",
}: CourseSaveButtonProps) {
  const [id, setId] = useState<string | null>(initialId);
  const [pending, start] = useTransition();
  const active = id !== null;

  function toggle() {
    if (pending || !firstBlockId) return;
    start(async () => {
      if (active && id) {
        const r = await deleteBookmark(id);
        if (r.ok) setId(null);
      } else {
        const r = await createBookmark(courseId, firstBlockId);
        if (r.ok && r.id) setId(r.id);
      }
    });
  }

  return (
    <GlassButton
      type="button"
      variant={active ? "primary" : "outline"}
      size={size}
      onClick={toggle}
      disabled={pending || !firstBlockId}
      aria-pressed={active}
    >
      {active ? <BookmarkFilledIcon size={15} /> : <BookmarkIcon size={15} />}
      {active ? labelSaved : labelSave}
    </GlassButton>
  );
}
