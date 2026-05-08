import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface PodiumEntry {
  rank: 1 | 2 | 3;
  name: string;
  xp: number;
  avatar: string;
}

interface RankEntry {
  rank: number;
  name: string;
  group: string;
  xp: number;
  delta: string;
  self?: boolean;
}

const PODIUM: PodiumEntry[] = [
  { rank: 2, name: "Sara M.", xp: 2840, avatar: "SM" },
  { rank: 1, name: "Élise R.", xp: 3120, avatar: "ER" },
  { rank: 3, name: "Karim B.", xp: 2610, avatar: "KB" },
];

const RANKING: RankEntry[] = [
  { rank: 4, name: "Théo D.", group: "3A", xp: 2480, delta: "+12" },
  { rank: 5, name: "Aïcha L.", group: "3A", xp: 2350, delta: "+8" },
  { rank: 6, name: "Vous", group: "3B", xp: 2180, delta: "+24", self: true },
  { rank: 7, name: "Lucas P.", group: "3B", xp: 2050, delta: "−3" },
];

const PODIUM_HEIGHTS: Record<1 | 2 | 3, string> = {
  1: "h-44",
  2: "h-32",
  3: "h-24",
};

function PodiumColumn({ entry }: { entry: PodiumEntry }) {
  const isFirst = entry.rank === 1;
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "relative h-12 w-12 rounded-full flex items-center justify-center font-bold bg-gradient-to-br from-canvas to-card border border-line text-foreground",
          isFirst && "ring-2 ring-brand ring-offset-2 ring-offset-card"
        )}
      >
        {entry.avatar}
        {isFirst && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-brand">
            <Icon name="crown" />
          </span>
        )}
      </div>
      <div className="mt-3 text-center">
        <div className="font-semibold text-[0.95rem]">{entry.name}</div>
        <div className="text-[0.78rem] text-ink-2 tabular-nums">
          {entry.xp.toLocaleString("fr-FR")} XP
        </div>
      </div>
      <div
        className={cn(
          "mt-3 w-full rounded-t-2xl border border-line border-b-0 bg-gradient-to-b flex items-start justify-center pt-3",
          PODIUM_HEIGHTS[entry.rank],
          isFirst ? "from-brand/25 to-brand/5" : "from-canvas to-card"
        )}
      >
        <span
          className={cn(
            "font-display text-3xl",
            isFirst ? "text-brand" : "text-ink-2"
          )}
        >
          #{entry.rank}
        </span>
      </div>
    </div>
  );
}

function RankRow({ entry }: { entry: RankEntry }) {
  return (
    <li
      className={cn(
        "py-3 flex items-center gap-3",
        entry.self && "relative"
      )}
    >
      {entry.self && (
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-brand" />
      )}
      <span
        className={cn(
          "font-mono text-[0.78rem] w-7 text-right",
          entry.self ? "text-brand font-semibold" : "text-ink-3"
        )}
      >
        #{entry.rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-medium truncate",
              entry.self && "text-brand"
            )}
          >
            {entry.name}
          </span>
          <Badge variant="default" size="sm" className="text-ink-3">
            {entry.group}
          </Badge>
        </div>
      </div>
      <span className="text-[0.85rem] text-ink-2 tabular-nums">
        {entry.xp.toLocaleString("fr-FR")}
      </span>
      <span
        className={cn(
          "text-[0.72rem] font-medium tabular-nums w-10 text-right",
          entry.delta.startsWith("−") ? "text-ink-3" : "text-emerald-600"
        )}
      >
        {entry.delta}
      </span>
    </li>
  );
}

export function LeaderboardPreview() {
  return (
    <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
      <Card className="lg:col-span-3 p-6 lg:p-9 shadow-[0_2px_30px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-ink-3">
              Classement · Promo 2026
            </div>
            <p className="mt-1 font-display text-2xl tracking-tight">
              Top 3 de la semaine
            </p>
          </div>
          <Badge variant="default">
            <Icon name="trophy" className="text-brand" /> Hebdomadaire
          </Badge>
        </div>

        <div className="mt-9 grid grid-cols-3 gap-3 lg:gap-5 items-end">
          {PODIUM.map((p) => (
            <PodiumColumn key={p.rank} entry={p} />
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-2 p-6 lg:p-7 shadow-[0_2px_30px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl tracking-tight">
            Classement complet
          </p>
          <button
            type="button"
            className="text-[0.78rem] text-ink-2 hover:text-foreground inline-flex items-center gap-1.5"
          >
            Filtrer <Icon name="sliders" className="text-[0.7rem]" />
          </button>
        </div>

        <ul className="mt-5 divide-y divide-line">
          {RANKING.map((r) => (
            <RankRow key={r.rank} entry={r} />
          ))}
        </ul>
      </Card>
    </div>
  );
}
