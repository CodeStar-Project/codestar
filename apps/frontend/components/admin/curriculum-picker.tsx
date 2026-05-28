"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { replaceCurriculum } from "@/app/actions/groups";
import { CourseMeta } from "@/components/course/course-meta";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassInput } from "@/components/ui/glass-input";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";
import type { CourseSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Labels {
  searchPlaceholder: string;
  selected: string;
  available: string;
  empty: string;
  emptyAvailable: string;
  save: string;
  cancel: string;
  saved: string;
}

interface CurriculumPickerProps {
  groupId: string;
  initialSelected: CourseSummary[];
  allCourses: CourseSummary[];
  labels: Labels;
  cancelHref: string;
  locale?: "fr" | "en";
}

export function CurriculumPicker({
  groupId,
  initialSelected,
  allCourses,
  labels,
  cancelHref,
  locale = "fr",
}: CurriculumPickerProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelected.map((c) => c.id))
  );
  const [query, setQuery] = useState("");
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCourses;
    return allCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.category ?? "").toLowerCase().includes(q)
    );
  }, [allCourses, query]);

  const selectedCourses = allCourses.filter((c) => selectedIds.has(c.id));
  const availableCourses = filtered.filter((c) => !selectedIds.has(c.id));

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function save() {
    start(async () => {
      const r = await replaceCurriculum(groupId, [...selectedIds]);
      if (r.ok) {
        setSavedAt(Date.now());
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <GlassInput
          type="search"
          placeholder={labels.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="text-[0.85rem] text-[color:var(--color-success)]">
              ✓ {labels.saved}
            </span>
          )}
          <GlassButton variant="ghost" onClick={() => router.push(cancelHref)}>
            {labels.cancel}
          </GlassButton>
          <GlassButton variant="primary" onClick={save} disabled={pending}>
            {labels.save}
          </GlassButton>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted">
            {labels.selected} ({selectedCourses.length})
          </h2>
          {selectedCourses.length === 0 ? (
            <GlassCard variant="plain" className="p-6 text-center text-text-soft">
              {labels.empty}
            </GlassCard>
          ) : (
            <ul className="space-y-2">
              {selectedCourses.map((c) => (
                <CourseRow
                  key={c.id}
                  course={c}
                  selected
                  onToggle={() => toggle(c.id)}
                  locale={locale}
                />
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted">
            {labels.available}
          </h2>
          {availableCourses.length === 0 ? (
            <GlassCard variant="plain" className="p-6 text-center text-text-soft">
              {labels.emptyAvailable}
            </GlassCard>
          ) : (
            <ul className="space-y-2">
              {availableCourses.map((c) => (
                <CourseRow
                  key={c.id}
                  course={c}
                  selected={false}
                  onToggle={() => toggle(c.id)}
                  locale={locale}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function CourseRow({
  course,
  selected,
  onToggle,
  locale,
}: {
  course: CourseSummary;
  selected: boolean;
  onToggle: () => void;
  locale: "fr" | "en";
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-[var(--r-lg)] border p-4 text-left transition-colors",
          selected
            ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]"
            : "border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] hover:bg-[color:var(--glass-bg-strong)]"
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-text">{course.title}</div>
          <div className="mt-1">
            <CourseMeta
              category={course.category}
              level={course.level}
              status={course.status}
              locale={locale}
              showStatus
            />
          </div>
        </div>
        <span
          className={cn(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
            selected
              ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-white"
              : "border-[color:var(--glass-border)] text-muted"
          )}
          aria-hidden
        >
          {selected ? <CheckIcon size={14} /> : <PlusIcon size={14} />}
        </span>
      </button>
    </li>
  );
}
