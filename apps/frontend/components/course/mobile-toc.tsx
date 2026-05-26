"use client";

import { useEffect, useState } from "react";

import { BlockToc } from "@/components/course/block-toc";
import { GlassButton } from "@/components/ui/glass-button";
import { ListIcon } from "@/components/ui/icons";
import type { CourseBlock } from "@/lib/types";

interface MobileTocProps {
  blocks: CourseBlock[];
  label: string;
  triggerLabel: string;
}

export function MobileToc({ blocks, label, triggerLabel }: MobileTocProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <>
      <GlassButton
        type="button"
        variant="glass"
        size="sm"
        onClick={() => setOpen(true)}
        className="lg:hidden"
      >
        <ListIcon size={14} />
        {triggerLabel}
      </GlassButton>
      {open && (
        <div
          role="dialog"
          aria-modal
          aria-label={label}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-[var(--r-xl)] border-t border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-2xl">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[color:var(--glass-border)]" />
            <BlockToc blocks={blocks} label={label} />
          </div>
        </div>
      )}
    </>
  );
}
