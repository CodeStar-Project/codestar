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
import { StatCard } from "@/components/course/stat-card";
import { StudentShell } from "@/components/course/student-shell";
import { GlassButton } from "@/components/ui/glass-button";
import {
  BookIcon,
  BookmarkFilledIcon,
  CheckIcon,
  FlameIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { parseProgress } from "@/lib/format";
import type { CourseSummary, Enrollment } from "@/lib/types";

export const metadata: Metadata = { title: "Learn" };

export default async function LearnPage() {
  const me = await requireAuth();
  const locale = (await getLocale()) as "fr" | "en";
  const [t, enrollments, groups, published, bookmarks] = await Promise.all([
    getTranslations("learn"),
    getMyEnrollments(),
    getMyGroups(),
    getPublishedCourses(),
    getMyBookmarks(),
  ]);

  const curricula = await Promise.all(groups.map((g) => getCurriculum(g.id)));
  const courseById = new Map<string, CourseSummary>();
  for (const c of published) courseById.set(c.id, c);
  for (const list of curricula) for (const c of list) courseById.set(c.id, c);

  const inProgress = enrollments
    .filter(
      (e) =>
        parseProgress(e.progress) > 0 &&
        parseProgress(e.progress) < 1 &&
        !e.completedAt
    )
    .sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime()
    );
  const completed = enrollments.filter(
    (e) => parseProgress(e.progress) >= 1 || e.completedAt
  );
  const enrolledIds = new Set(enrollments.map((e) => e.courseId));
  const discover = [...courseById.values()]
    .filter((c) => !enrolledIds.has(c.id))
    .slice(0, 6);

  const firstName = me.displayName.split(/\s+/)[0] || me.displayName;
  const dateLabel = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <StudentShell maxWidth="wide">
      {/* Hero greeting */}
      <section className="mb-12 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-stretch">
        <div className="flex flex-col justify-center">
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted">
            {dateLabel}
          </div>
          <h1 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.04] tracking-tight text-text">
            {t("greeting", { name: firstName })}
          </h1>
          <p className="mt-3 max-w-lg text-[1.05rem] text-text-soft">
            {inProgress.length > 0
              ? t("continueWithCourse")
              : t("startSomething")}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label={t("statInProgress")}
            value={inProgress.length}
            icon={<BookIcon size={18} />}
          />
          <StatCard
            label={t("statCompleted")}
            value={completed.length}
            icon={<CheckIcon size={18} />}
          />
          <StatCard
            label={t("statBookmarks")}
            value={bookmarks.length}
            icon={<BookmarkFilledIcon size={18} />}
          />
        </div>
      </section>

      {/* Resume */}
      <section className="mb-14">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-2xl tracking-tight text-text md:text-3xl">
            {t("resumeTitle")}
          </h2>
          <GlassButton asChild variant="ghost" size="sm">
            <Link href="/my-courses">{t("allCourses")} →</Link>
          </GlassButton>
        </div>
        {inProgress.length === 0 ? (
          <EmptyState
            icon={<FlameIcon size={20} />}
            title={t("resumeEmpty")}
            description={t("resumeEmptyDesc")}
            action={
              <GlassButton asChild variant="primary">
                <Link href="/courses">{t("browseCta")}</Link>
              </GlassButton>
            }
          />
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
                    ctaLabel={t("resumeCta")}
                  />
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* Discover */}
      <section className="mb-14">
        <div className="mb-5">
          <h2 className="font-display text-2xl tracking-tight text-text md:text-3xl">
            {t("discoverTitle")}
          </h2>
          <p className="mt-1 text-[0.95rem] text-text-soft">
            {t("discoverDesc")}
          </p>
        </div>
        {discover.length === 0 ? (
          <EmptyState icon={<BookIcon size={20} />} title={t("discoverEmpty")} />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {discover.map((c) => (
              <li key={c.id}>
                <CourseCard
                  course={c}
                  href={`/courses/${c.slug}`}
                  locale={locale}
                  ctaLabel={t("openCta")}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* My groups */}
      {groups.length > 0 && (
        <section>
          <h2 className="mb-5 font-display text-2xl tracking-tight text-text md:text-3xl">
            {t("groupsTitle")}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <li key={g.id}>
                <Link
                  href="/courses"
                  className="block focus-visible:outline-none"
                >
                  <div className="glass flex items-center gap-3 rounded-[var(--r-lg)] p-4 transition-transform hover:-translate-y-0.5">
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[color:var(--color-accent)]"
                      style={{ background: "var(--color-accent-soft)" }}
                      aria-hidden
                    >
                      <UsersIcon size={18} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-text">
                        {g.name}
                      </div>
                      <div className="text-[0.8rem] text-muted">{g.slug}</div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </StudentShell>
  );
}
