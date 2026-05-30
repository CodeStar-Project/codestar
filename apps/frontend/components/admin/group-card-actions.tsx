"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteGroup, exportGroupStatsCsv } from "@/app/actions/groups";
import { GlassButton } from "@/components/ui/glass-button";
import { TrashIcon } from "@/components/ui/icons";

interface Labels {
  exportCsv: string;
  delete: string;
  confirmDelete: string;
}

interface GroupCardActionsProps {
  groupId: string;
  groupName: string;
  canDelete: boolean;
  labels: Labels;
}

export function GroupCardActions({
  groupId,
  groupName,
  canDelete,
  labels,
}: GroupCardActionsProps) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function exportCsv() {
    start(async () => {
      const r = await exportGroupStatsCsv(groupId);
      if (!r.ok || !r.csv) return;
      const blob = new Blob([r.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `group-${groupName.replace(/[^a-z0-9-]+/gi, "_")}-stats.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function destroy() {
    if (!confirm(labels.confirmDelete)) return;
    start(async () => {
      const r = await deleteGroup(groupId);
      if (r.ok) router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 text-[0.85rem]">
      <GlassButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={exportCsv}
        disabled={pending}
        aria-label={`${labels.exportCsv} ${groupName}`}
      >
        ⇩ {labels.exportCsv}
      </GlassButton>
      {canDelete && (
        <GlassButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={destroy}
          disabled={pending}
          aria-label={`${labels.delete} ${groupName}`}
          className="text-[color:var(--color-danger)] hover:text-[color:var(--color-danger)]"
        >
          <TrashIcon size={14} />
        </GlassButton>
      )}
    </div>
  );
}
