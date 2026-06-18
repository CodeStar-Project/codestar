"use client";

import { useState, useTransition } from "react";

import { createBookmark, deleteBookmark } from "@/app/actions/bookmarks";
import { GlassButton } from "@/components/ui/glass-button";
import {
  BookmarkFilledIcon,
  BookmarkIcon,
} from "@/components/ui/icons";

interface BookmarkButtonProps {
  courseId: string;
  blockId: string;
  initialId: string | null;
  labelAdd: string;
  labelRemove: string;
  iconOnly?: boolean;
}

export function BookmarkButton({
  courseId,
  blockId,
  initialId,
  labelAdd,
  labelRemove,
  iconOnly = false,
}: BookmarkButtonProps) {
  const [id, setId] = useState<string | null>(initialId);
  const [pending, start] = useTransition();
  const active = id !== null;

  function toggle() {
    if (pending) return;
    start(async () => {
      if (active && id) {
        const r = await deleteBookmark(id);
        if (r.ok) setId(null);
      } else {
        const r = await createBookmark(courseId, blockId);
        if (r.ok && r.id) setId(r.id);
      }
    });
  }

  return (
    <GlassButton
      type="button"
      variant={active ? "primary" : "ghost"}
      size="sm"
      onClick={toggle}
      disabled={pending}
      aria-pressed={active}
      aria-label={active ? labelRemove : labelAdd}
    >
      {active ? <BookmarkFilledIcon size={14} /> : <BookmarkIcon size={14} />}
      {!iconOnly && (active ? labelRemove : labelAdd)}
    </GlassButton>
  );
}
