"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
  deleteBtn: string;
  empty: string;
}

interface GroupsGridProps {
  groups: GroupItem[];
  isAdmin: boolean;
  labels: Labels;
}

interface GroupCardProps {
  group: GroupItem;
  isAdmin: boolean;
  labels: Labels;
}

function GroupCard({ group: g, isAdmin, labels }: GroupCardProps) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    if (!confirm(`${labels.deleteConfirm}\n\n"${g.name}"`)) return;
    setError("");
    start(async () => {
      const res = await deleteGroup(g.id);
      if (!res.ok) {
        setError(res.error ?? "Erreur lors de la suppression.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <GlassCard variant="default">
      <GlassCardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-text">{g.name}</p>
            <p className="text-xs text-text-soft">/{g.slug}</p>
          </div>
          {isAdmin && (
            <GlassButton
              variant="danger"
              size="sm"
              disabled={pending}
              onClick={handleDelete}
              className="shrink-0 text-xs"
            >
              {pending ? "…" : labels.deleteBtn}
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

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="mt-1 flex gap-2">
          <Link
            href={`/admin/groups/${g.id}/members`}
            className="flex-1"
          >
            <GlassButton variant="outline" size="sm" className="w-full text-xs">
              {labels.members}
            </GlassButton>
          </Link>
          <Link
            href={`/admin/groups/${g.id}/curriculum`}
            className="flex-1"
          >
            <GlassButton variant="outline" size="sm" className="w-full text-xs">
              {labels.curriculum}
            </GlassButton>
          </Link>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}

export function GroupsGrid({ groups, isAdmin, labels }: GroupsGridProps) {
  if (groups.length === 0) {
    return (
      <p className="mt-8 text-center text-text-soft">{labels.empty}</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => (
        <GroupCard key={g.id} group={g} isAdmin={isAdmin} labels={labels} />
      ))}
    </div>
  );
}
