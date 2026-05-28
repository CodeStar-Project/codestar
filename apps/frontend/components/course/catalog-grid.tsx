"use client";

import { useMemo, useState } from "react";

import { CourseCard } from "@/components/course/course-card";
import { EmptyState } from "@/components/course/empty-state";
import { GlassChip } from "@/components/ui/glass-chip";
import { GlassInput } from "@/components/ui/glass-input";
import { BookIcon } from "@/components/ui/icons";
import type { CourseSummary } from "@/lib/types";

interface Labels {
  search: string;
  empty: string;
  emptyFiltered: string;
  tabAll: string;
  tabMine: string;
}

interface CatalogGridProps {
  allCourses: CourseSummary[];
  groupCourseIds: string[];
  labels: Labels;
  locale: "fr" | "en";
}

export function CatalogGrid({
  allCourses,
  groupCourseIds,
  labels,
  locale,
}: CatalogGridProps) {
  const [scope, setScope] = useState<"all" | "mine">("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const groupSet = useMemo(() => new Set(groupCourseIds), [groupCourseIds]);
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const c of allCourses) {
      if (c.category) set.add(c.category);
    }
    return [...set].sort();
  }, [allCourses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCourses.filter((c) => {
      if (scope === "mine" && !groupSet.has(c.id)) return false;
      if (category && c.category !== category) return false;
      if (q && !c.title.toLowerCase().includes(q) && !(c.description ?? "").toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [allCourses, scope, groupSet, category, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <GlassChip
            asButton
            variant={scope === "all" ? "accent" : "default"}
            onClick={() => setScope("all")}
          >
            {labels.tabAll}
          </GlassChip>
          <GlassChip
            asButton
            variant={scope === "mine" ? "accent" : "default"}
            onClick={() => setScope("mine")}
          >
            {labels.tabMine}
          </GlassChip>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <GlassInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.search}
            className="max-w-md"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <GlassChip
              asButton
              variant={category === null ? "accent" : "default"}
              size="sm"
              onClick={() => setCategory(null)}
            >
              ✦
            </GlassChip>
            {categories.map((c) => (
              <GlassChip
                key={c}
                asButton
                variant={category === c ? "accent" : "default"}
                size="sm"
                onClick={() => setCategory(c === category ? null : c)}
              >
                {c}
              </GlassChip>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookIcon size={20} />}
          title={query || category ? labels.emptyFiltered : labels.empty}
        />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <li key={c.id}>
              <CourseCard course={c} href={`/courses/${c.slug}`} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
