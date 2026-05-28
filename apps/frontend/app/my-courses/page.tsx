import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { getPublishedCourses } from "@/app/actions/courses";
import { getMyEnrollments } from "@/app/actions/enrollments";
import { getCurriculum, getMyGroups } from "@/app/actions/groups";
import { requireAuth } from "@/components/admin/role-guard";
import { CourseCard } from "@/components/course/course-card";
import { EmptyState } from "@/components/course/empty-state";
import { PageHeader } from "@/components/course/page-header";
import { StudentShell } from "@/components/course/student-shell";
import { BookIcon } from "@/components/ui/icons";
import { parseProgress } from "@/lib/format";
import type { CourseSummary, Enrollment } from "@/lib/types";

export const metadata: Metadata = { title: "Mes cours" };

interface Row {
  course: CourseSummary;
  enrollment: Enrollment | null;
}

export default async function MyCoursesPage() {
  await requireAuth();
  const locale = (await getLocale()) as "fr" | "en";
  const [t, enrollments, groups, published] = await Promise.all([
    getTranslations("myCourses"),
    getMyEnrollments(),
    getMyGroups(),
    getPublishedCourses(),
  ]);

  const curricula = await Promise.all(groups.map((g) => getCurriculum(g.id)));
  const courseById = new Map<string, CourseSummary>();
  for (const c of published) courseById.set(c.id, c);
  for (const list of curricula) for (const c of list) courseById.set(c.id, c);

  const enrollmentMap = new Map<string, Enrollment>(
    enrollments.map((e) => [e.courseId, e])
  );

  const inProgress: Row[] = [];
  const completed: Row[] = [];
  for (const e of enrollments) {
    const c = courseById.get(e.courseId);
    if (!c) continue;
    const p = parseProgress(e.progress);
    if (p >= 1 || e.completedAt) completed.push({ course: c, enrollment: e });
    else inProgress.push({ course: c, enrollment: e });
  }
  inProgress.sort(
    (a, b) =>
      new Date(b.enrollment!.lastActivityAt).getTime() -
      new Date(a.enrollment!.lastActivityAt).getTime()
  );

  const assignedFromGroups = new Map<string, CourseSummary>();
  for (const list of curricula) {
    for (const c of list) {
      if (!enrollmentMap.has(c.id)) assignedFromGroups.set(c.id, c);
    }
  }
  const toStart: Row[] = [...assignedFromGroups.values()].map((c) => ({
    course: c,
    enrollment: null,
  }));

  return (
    <StudentShell maxWidth="wide">
      <PageHeader
        kicker={t("kicker")}
        title={t("title")}
        description={t("description")}
        className="mb-10"
      />

      <Section
        title={t("sections.inProgress")}
        empty={t("empty.inProgress")}
        rows={inProgress}
        variant="in-progress"
        cta={t("ctaResume")}
        locale={locale}
        readerLink
      />

      <Section
        title={t("sections.completed")}
        empty={t("empty.completed")}
        rows={completed}
        variant="completed"
        cta={t("ctaReview")}
        locale={locale}
      />

      <Section
        title={t("sections.toStart")}
        empty={t("empty.toStart")}
        rows={toStart}
        variant="ghost"
        cta={t("ctaStart")}
        locale={locale}
      />
    </StudentShell>
  );
}

function Section({
  title,
  empty,
  rows,
  variant,
  cta,
  locale,
  readerLink = false,
}: {
  title: string;
  empty: string;
  rows: Row[];
  variant: "in-progress" | "completed" | "ghost";
  cta: string;
  locale: "fr" | "en";
  readerLink?: boolean;
}) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="mb-5 font-display text-2xl tracking-tight text-text md:text-3xl">
        {title}
      </h2>
      {rows.length === 0 ? (
        <EmptyState icon={<BookIcon size={20} />} title={empty} />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ course, enrollment }) => (
            <li key={course.id}>
              <CourseCard
                course={course}
                href={
                  readerLink
                    ? `/courses/${course.slug}/read`
                    : `/courses/${course.slug}`
                }
                progress={enrollment?.progress ?? undefined}
                variant={variant}
                ctaLabel={cta}
                locale={locale}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
