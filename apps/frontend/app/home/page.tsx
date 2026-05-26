import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { getMyBookmarks } from "@/app/actions/bookmarks";
import { getPublishedCourses } from "@/app/actions/courses";
import { getMyEnrollments } from "@/app/actions/enrollments";
import { getMyGroups, getCurriculum } from "@/app/actions/groups";
import { requireAuth } from "@/components/admin/role-guard";
import { CourseCard } from "@/components/course/course-card";
import { EmptyState } from "@/components/course/empty-state";
import { StudentShell } from "@/components/course/student-shell";
import { GlassButton } from "@/components/ui/glass-button";
import {
  GlassCard,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { ArrowRightIcon, BookIcon, FlameIcon } from "@/components/ui/icons";
import { parseProgress } from "@/lib/format";
import type { CourseSummary, Enrollment } from "@/lib/types";

export const metadata: Metadata = { title: "Accueil" };

export default async function StudentHomePage() {
  const me = await requireAuth();
  const locale = (await getLocale()) as "fr" | "en";
  const [t, enrollments, groups, published, bookmarks] = await Promise.all([
    getTranslations("studentHome"),
    getMyEnrollments(),
    getMyGroups(),
    getPublishedCourses(),
    getMyBookmarks(),
  ]);

  const curriculaLists = await Promise.all(
    groups.map((g) => getCurriculum(g.id))
  );
  const curriculumMap = new Map<string, CourseSummary>();
  for (const list of curriculaLists) {
    for (const c of list) curriculumMap.set(c.id, c);
  }
  const courseById = new Map<string, CourseSummary>();
  for (const c of [...published, ...curriculumMap.values()]) {
    courseById.set(c.id, c);
  }

  const inProgress = enrollments
    .filter((e) => {
      const p = parseProgress(e.progress);
      return p > 0 && p < 1;
    })
    .map((e) => ({ enrollment: e, course: courseById.get(e.courseId) }))
    .filter((x): x is { enrollment: Enrollment; course: CourseSummary } => !!x.course)
    .sort(
      (a, b) =>
        new Date(b.enrollment.lastActivityAt).getTime() -
        new Date(a.enrollment.lastActivityAt).getTime()
    )
    .slice(0, 3);

  const enrolledIds = new Set(enrollments.map((e) => e.courseId));
  const discover = [...curriculumMap.values()]
    .filter((c) => !enrolledIds.has(c.id))
    .slice(0, 6);

  const dateLabel = new Date().toLocaleDateString(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  const streak = 0;
  const xpTotal = 0;
  const rank = "—";

  return (
    <StudentShell maxWidth="wide">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted">
            {dateLabel}
          </div>
          <h1 className="mt-2 font-display text-[clamp(2rem,4.5vw,3.4rem)] leading-tight tracking-tight text-text">
            {t("greeting", { name: me.displayName })}
            <br />
            <span className="text-text-soft italic">
              {streak > 0 ? t("streak", { count: streak }) : t("streakNoStreak")}{" "}
              {streak > 0 && t("continue")}
            </span>
          </h1>
        </div>

        <GlassCard variant="tinted">
          <GlassCardContent className="flex flex-wrap items-center gap-6 p-5">
            <div className="flex items-center gap-3">
              <div
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[color:var(--color-accent)]"
                style={{ background: "var(--color-accent-soft)" }}
                aria-hidden
              >
                <FlameIcon size={20} />
              </div>
              <div>
                <div className="text-[0.72rem] uppercase tracking-[0.14em] text-muted">
                  {t("statXp")}
                </div>
                <div className="font-display text-[1.6rem] leading-none text-text">
                  {xpTotal}
                </div>
              </div>
            </div>
            <div className="h-10 w-px bg-[color:var(--glass-border)]" aria-hidden />
            <div>
              <div className="text-[0.72rem] uppercase tracking-[0.14em] text-muted">
                {t("statRank")}
              </div>
              <div className="font-display text-[1.6rem] leading-none text-text">
                {rank}
              </div>
            </div>
            <div className="ml-auto text-[0.85rem] text-muted">
              {bookmarks.length > 0 && (
                <Link href="/bookmarks" className="text-text-soft hover:text-text">
                  ★ {bookmarks.length}
                </Link>
              )}
            </div>
          </GlassCardContent>
        </GlassCard>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight text-text md:text-3xl">
            {t("resumeTitle")}
          </h2>
          <GlassButton asChild variant="ghost" size="sm">
            <Link href="/my-courses">
              {t("browseCta")} <ArrowRightIcon size={14} />
            </Link>
          </GlassButton>
        </div>
        {inProgress.length === 0 ? (
          <EmptyState
            icon={<BookIcon size={20} />}
            title={t("resumeEmpty")}
            action={
              <GlassButton asChild variant="primary">
                <Link href="/courses">{t("browseCta")}</Link>
              </GlassButton>
            }
          />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {inProgress.map(({ enrollment, course }) => (
              <li key={course.id}>
                <CourseCard
                  course={course}
                  progress={enrollment.progress}
                  variant="in-progress"
                  href={`/courses/${course.slug}/read`}
                  ctaLabel={t("resumeTitle")}
                  locale={locale}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-text md:text-3xl">
              {t("discoverTitle")}
            </h2>
            <p className="mt-1 text-[0.95rem] text-text-soft">
              {t("discoverDesc")}
            </p>
          </div>
          <GlassButton asChild variant="ghost" size="sm">
            <Link href="/courses">
              {t("browseCta")} <ArrowRightIcon size={14} />
            </Link>
          </GlassButton>
        </div>
        {discover.length === 0 ? (
          <EmptyState
            icon={<BookIcon size={20} />}
            title={t("resumeEmpty")}
            action={
              <GlassButton asChild variant="primary">
                <Link href="/courses">{t("browseCta")}</Link>
              </GlassButton>
            }
          />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {discover.map((c) => (
              <li key={c.id}>
                <CourseCard
                  course={c}
                  href={`/courses/${c.slug}`}
                  locale={locale}
                  ctaLabel={t("browseCta")}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </StudentShell>
  );
}
