"use client";

// Groups grid — one card per group with member/curriculum links and admin delete.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useState, useTransition } from "react";

import { deleteGroup } from "@/app/actions/groups";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { GlassChip } from "@/components/ui/glass-chip";
import { ArrowRightIcon, BookIcon, TrashIcon, UsersIcon } from "@/components/ui/icons";

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
  deleteError: string;
  dateSince: string;
  dateUntil: string;
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

const PALETTE = [
  { bg: "rgba(109,40,217,0.22)", text: "#a78bfa" },
  { bg: "rgba(3,105,161,0.22)", text: "#38bdf8" },
  { bg: "rgba(5,150,105,0.22)", text: "#34d399" },
  { bg: "rgba(217,119,6,0.22)", text: "#fbbf24" },
  { bg: "rgba(190,24,93,0.22)", text: "#f472b6" },
  { bg: "rgba(126,34,206,0.22)", text: "#d8b4fe" },
];

function slugPalette(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

// Builds a localized "since/until" range from optional start/end dates.
function formatDateRange(
  startsAt: string | null,
  endsAt: string | null,
  locale: string,
  labels: Labels
) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(locale, { month: "short", year: "numeric" });
  if (startsAt && endsAt) return `${fmt(startsAt)} → ${fmt(endsAt)}`;
  if (startsAt) return labels.dateSince.replace("{date}", fmt(startsAt));
  if (endsAt) return labels.dateUntil.replace("{date}", fmt(endsAt));
  return null;
}

function GroupCard({ group: g, isAdmin, labels }: GroupCardProps) {
  const router = useRouter();
  const locale = useLocale();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const palette = slugPalette(g.slug);
  const dateLabel = formatDateRange(g.startsAt, g.endsAt, locale, labels);

  function handleDelete() {
    if (!confirm(`${labels.deleteConfirm}\n\n"${g.name}"`)) return;
    setError("");
    start(async () => {
      const res = await deleteGroup(g.id);
      if (!res.ok) {
        setError(res.error ?? labels.deleteError);
        return;
      }
      router.refresh();
    });
  }

  return (
    <GlassCard variant="default">
      <GlassCardContent className="p-0">
        {/* Header */}
        <div className="flex items-start gap-3 p-4 pb-3">
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold uppercase"
            style={{ background: palette.bg, color: palette.text }}
          >
            {g.name[0]}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold leading-snug text-text">{g.name}</p>
            <p className="font-mono text-[0.7rem] text-text-soft">/{g.slug}</p>
          </div>

          {isAdmin && (
            <button
              type="button"
              disabled={pending}
              onClick={handleDelete}
              className="mt-0.5 shrink-0 rounded-lg p-1.5 text-text-soft opacity-50 transition-all hover:bg-red-500/15 hover:text-red-400 hover:opacity-100 disabled:opacity-30"
              title={labels.deleteBtn}
            >
              <TrashIcon size={15} />
            </button>
          )}
        </div>

        {dateLabel && (
          <div className="px-4 pb-3">
            <GlassChip size="sm">{dateLabel}</GlassChip>
          </div>
        )}

        {error && <p className="px-4 pb-2 text-xs text-red-400">{error}</p>}

        <div className="mx-4 border-t border-[color:var(--glass-border)]" />

        <Link
          href={`/admin/groups/${g.id}/members`}
          className="flex items-center gap-3 px-4 py-3 text-sm text-text-soft transition-colors hover:bg-[color:var(--glass-bg)] hover:text-text"
        >
          <UsersIcon size={15} className="shrink-0" />
          <span className="flex-1">{labels.members}</span>
          <ArrowRightIcon size={14} className="opacity-40" />
        </Link>

        <div className="mx-4 border-t border-[color:var(--glass-border)]" />

        <Link
          href={`/admin/groups/${g.id}/curriculum`}
          className="flex items-center gap-3 rounded-b-[var(--r-lg)] px-4 py-3 text-sm text-text-soft transition-colors hover:bg-[color:var(--glass-bg)] hover:text-text"
        >
          <BookIcon size={15} className="shrink-0" />
          <span className="flex-1">{labels.curriculum}</span>
          <ArrowRightIcon size={14} className="opacity-40" />
        </Link>
      </GlassCardContent>
    </GlassCard>
  );
}

export function GroupsGrid({ groups, isAdmin, labels }: GroupsGridProps) {
  if (groups.length === 0) {
    return <p className="mt-8 text-center text-text-soft">{labels.empty}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => (
        <GroupCard key={g.id} group={g} isAdmin={isAdmin} labels={labels} />
      ))}
    </div>
  );
}
