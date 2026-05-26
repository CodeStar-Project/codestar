"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteBookmark } from "@/app/actions/bookmarks";
import { GlassButton } from "@/components/ui/glass-button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import { BookmarkFilledIcon, TrashIcon } from "@/components/ui/icons";
import type { BookmarkEnriched } from "@/lib/types";

interface BookmarkRowProps {
  bookmark: BookmarkEnriched;
  labelView: string;
  labelRemove: string;
}

export function BookmarkRow({
  bookmark,
  labelView,
  labelRemove,
}: BookmarkRowProps) {
  const router = useRouter();
  const [removed, setRemoved] = useState(false);
  const [pending, start] = useTransition();

  function remove() {
    start(async () => {
      const r = await deleteBookmark(bookmark.id);
      if (r.ok) {
        setRemoved(true);
        router.refresh();
      }
    });
  }

  if (removed) return null;

  return (
    <GlassCard variant="default" className="h-full">
      <GlassCardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.14em] text-muted">
          <BookmarkFilledIcon
            size={12}
            className="text-[color:var(--color-accent)]"
          />
          {bookmark.blockKind} · #{bookmark.blockOrderIndex + 1}
        </div>
        <GlassCardTitle as="h3" className="text-[1.05rem]">
          {bookmark.blockPreview ?? `Bloc ${bookmark.blockOrderIndex + 1}`}
        </GlassCardTitle>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <GlassButton asChild variant="ghost" size="sm">
            <Link
              href={`/courses/${bookmark.courseSlug}/read#block-${bookmark.blockId}`}
            >
              {labelView}
            </Link>
          </GlassButton>
          <GlassButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={remove}
            disabled={pending}
            aria-label={labelRemove}
            className="ml-auto text-[color:var(--color-danger)]"
          >
            <TrashIcon size={14} />
          </GlassButton>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
