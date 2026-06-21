"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteGroup } from "@/app/actions/groups";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";

interface GroupItem {
  id: string;
  name: string;
  slug: string;
  startsAt: string | null;
  endsAt: string | null;
}

interface Labels {
  members: string;
  curriculum: string;
  deleteConfirm: string;
  empty: string;
}

interface GroupsGridProps {
  groups: GroupItem[];
  isAdmin: boolean;
  labels: Labels;
}

export function GroupsGrid({ groups, isAdmin, labels }: GroupsGridProps) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleDelete(id: string, name: string) {
    if (!confirm(`${labels.deleteConfirm}\n\n"${name}"`)) return;
    start(async () => {
      await deleteGroup(id);
      router.refresh();
    });
  }

  if (groups.length === 0) {
    return (
      <p className="mt-8 text-center text-text-soft">{labels.empty}</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => (
        <GlassCard key={g.id} variant="default">
          <GlassCardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-text">{g.name}</p>
                <p className="text-xs text-text-soft">/{g.slug}</p>
              </div>
              {isAdmin && (
                <GlassButton
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => handleDelete(g.id, g.name)}
                  className="shrink-0 text-xs text-red-400 hover:text-red-300"
                >
                  Suppr.
                </GlassButton>
              )}
            </div>

            {(g.startsAt || g.endsAt) && (
              <p className="text-xs text-text-soft">
                {g.startsAt ? new Date(g.startsAt).toLocaleDateString() : "—"}
                {" → "}
                {g.endsAt ? new Date(g.endsAt).toLocaleDateString() : "∞"}
              </p>
            )}

            <div className="mt-1 flex gap-2">
              <GlassButton
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/groups/${g.id}`)}
                className="flex-1 text-xs"
              >
                {labels.members}
              </GlassButton>
              <GlassButton
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/groups/${g.id}/curriculum`)}
                className="flex-1 text-xs"
              >
                {labels.curriculum}
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>
      ))}
    </div>
  );
}
