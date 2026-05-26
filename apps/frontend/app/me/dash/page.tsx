import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { getMyBookmarks } from "@/app/actions/bookmarks";
import { getPublishedCourses } from "@/app/actions/courses";
import { getMyEnrollments } from "@/app/actions/enrollments";
import { getCurriculum, getMyGroups } from "@/app/actions/groups";
import { requireAuth } from "@/components/admin/role-guard";
import { CourseCard } from "@/components/course/course-card";
import { EmptyState } from "@/components/course/empty-state";
import { PageHeader } from "@/components/course/page-header";
import { StatCard } from "@/components/course/stat-card";
import { StudentShell } from "@/components/course/student-shell";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import {
  BookIcon,
  BookmarkFilledIcon,
  ChartIcon,
  CheckIcon,
  FlameIcon,
  TrophyIcon,
} from "@/components/ui/icons";
import { parseProgress } from "@/lib/format";
import type { CourseSummary, Enrollment } from "@/lib/types";

export const metadata: Metadata = { title: "Mes progrès" };

export default async function StudentDashPage() {
  const me = await requireAuth();
  const locale = (await getLocale()) as "fr" | "en";
  const [t, enrollments, groups, published, bookmarks] = await Promise.all([
    getTranslations("dash"),
    getMyEnrollments(),
    getMyGroups(),
    getPublishedCourses(),
    getMyBookmarks(),
  ]);

  const curricula = await Promise.all(groups.map((g) => getCurriculum(g.id)));
  const courseById = new Map<string, CourseSummary>();
  for (const c of published) courseById.set(c.id, c);
  for (const list of curricula) for (const c of list) courseById.set(c.id, c);

  const completed = enrollments.filter(
    (e) => parseProgress(e.progress) >= 1 || e.completedAt
  );
  const inProgress = enrollments.filter(
    (e) =>
      parseProgress(e.progress) > 0 &&
      parseProgress(e.progress) < 1 &&
      !e.completedAt
  );
  const enrolledIds = new Set(enrollments.map((e) => e.courseId));
  const discoverCount = [...courseById.keys()].filter((id) => !enrolledIds.has(id)).length;

  return (
    <StudentShell maxWidth="wide">
      <PageHeader
        kicker={t("kicker")}
        title={t("title")}
        description={t("description")}
        className="mb-10"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("stats.completed")}
          value={completed.length}
          icon={<CheckIcon size={18} />}
        />
        <StatCard
          label={t("stats.inProgress")}
          value={inProgress.length}
          icon={<BookIcon size={18} />}
        />
        <StatCard
          label={t("stats.discover")}
          value={discoverCount}
          icon={<ChartIcon size={18} />}
        />
        <StatCard
          label={t("stats.streak")}
          value="0"
          hint={me.displayName}
          icon={<FlameIcon size={18} />}
        />
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <GlassCard variant="default">
          <GlassCardContent className="p-6">
            <div className="mb-3 flex items-center gap-3">
              <ChartIcon size={18} className="text-[color:var(--color-accent)]" />
              <h2 className="font-display text-xl text-text">
                {t("activityTitle")}
              </h2>
            </div>
            <div className="flex aspect-[2/1] items-center justify-center rounded-[var(--r)] border border-dashed border-[color:var(--glass-border)] text-muted">
              {t("activitySoon")}
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="default">
          <GlassCardContent className="p-6">
            <div className="mb-3 flex items-center gap-3">
              <TrophyIcon size={18} className="text-[color:var(--color-accent)]" />
              <h2 className="font-display text-xl text-text">
                {t("badgesTitle")}
              </h2>
              {bookmarks.length > 0 && (
                <span className="ml-auto inline-flex items-center gap-1 text-[0.85rem] text-text-soft">
                  <BookmarkFilledIcon
                    size={12}
                    className="text-[color:var(--color-accent)]"
                  />
                  <Link href="/bookmarks" className="hover:text-text">
                    {bookmarks.length}
                  </Link>
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  aria-hidden
                  className="flex aspect-square items-center justify-center rounded-[var(--r)] border border-dashed border-[color:var(--glass-border)] text-muted opacity-50"
                >
                  ?
                </div>
              ))}
            </div>
            <p className="mt-3 text-[0.82rem] text-muted">{t("badgesSoon")}</p>
          </GlassCardContent>
        </GlassCard>
      </div>

      <section className="mt-12">
        <h2 className="mb-5 font-display text-2xl tracking-tight text-text md:text-3xl">
          {t("resumeTitle")}
        </h2>
        {inProgress.length === 0 ? (
          <EmptyState icon={<BookIcon size={20} />} title={t("activitySoon")} />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {inProgress
              .map((e) => ({ e, c: courseById.get(e.courseId) }))
              .filter((x): x is { e: Enrollment; c: CourseSummary } => !!x.c)
              .slice(0, 3)
              .map(({ e, c }) => (
                <li key={c.id}>
                  <CourseCard
                    course={c}
                    href={`/courses/${c.slug}/read`}
                    progress={e.progress}
                    variant="in-progress"
                    locale={locale}
                  />
                </li>
              ))}
          </ul>
        )}
      </section>
    </StudentShell>
  );
}
