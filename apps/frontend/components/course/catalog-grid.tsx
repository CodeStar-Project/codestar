"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { CatalogCourseCard } from "@/components/course/catalog-course-card";
import { EmptyState } from "@/components/course/empty-state";
import { GlassChip } from "@/components/ui/glass-chip";
import { GlassInput } from "@/components/ui/glass-input";
import { BookIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { CourseSummary } from "@/lib/types";

interface CatalogGridProps {
  allCourses: CourseSummary[];
  groupCourseIds: string[];
  locale: "fr" | "en";
}

export function CatalogGrid({
  allCourses,
  groupCourseIds,
  locale,
}: CatalogGridProps) {
  const t = useTranslations("catalog");
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

  const scopes: { id: "all" | "mine"; label: string }[] = [
    { id: "all", label: t("tabs.all") },
    { id: "mine", label: t("tabs.mine") },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] p-0.5 backdrop-blur-md">
            {scopes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScope(s.id)}
                aria-pressed={scope === s.id}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[0.85rem] transition-colors",
                  scope === s.id
                    ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                    : "text-text-soft hover:text-text"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <span className="text-[0.82rem] text-muted" aria-live="polite">
            {t("results", { count: filtered.length })}
          </span>
        </div>

        <GlassInput
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          className="w-full"
        />

        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <GlassChip
              asButton
              variant={category === null ? "accent" : "default"}
              size="sm"
              onClick={() => setCategory(null)}
            >
              {t("allCategories")}
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
          title={query || category ? t("emptyFiltered") : t("empty")}
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <li key={c.id}>
              <CatalogCourseCard course={c} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
