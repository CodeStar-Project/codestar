import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { getInstanceBranding } from "@/app/actions/instance";
import { getMyAuthoredCourses } from "@/app/actions/courses";
import { getMyGroups } from "@/app/actions/groups";
import { getSettings } from "@/app/actions/settings";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/components/admin/role-guard";
import { CourseMeta } from "@/components/course/course-meta";
import { EmptyState } from "@/components/course/empty-state";
import { PageHeader } from "@/components/course/page-header";
import { StatCard } from "@/components/course/stat-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { GlassChip } from "@/components/ui/glass-chip";
import {
  BookIcon,
  CheckIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/ui/icons";
import type { CourseSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Studio" };

export default async function StudioPage() {
  await requireRole("TEACHER");
  const locale = (await getLocale()) as "fr" | "en";
  const [t, branding, courses, groups, settings] = await Promise.all([
    getTranslations("studio"),
    getInstanceBranding(),
    getMyAuthoredCourses(),
    getMyGroups(),
    getSettings(),
  ]);

  const published = courses.filter((c) => c.status === "PUBLISHED").length;
  const drafts = courses.filter((c) => c.status === "DRAFT").length;
  const teachingGroups = groups.filter((g) => g.roleInGroup === "TEACHER");
  const recent = [...courses].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <AdminShell>
      <PageHeader
        kicker={t("kicker", { name: branding.name })}
        title={t("title")}
        description={t("description")}
        actions={
          <>
            <GlassButton asChild variant="primary">
              <Link href="/admin/courses/new">
                <PlusIcon size={14} />
                {t("newCourse")}
              </Link>
            </GlassButton>
            <GlassButton variant="outline" disabled>
              <SparklesIcon size={14} />
              {t("generateAi")}
              <GlassChip variant="default" size="sm" className="ml-1">
                {t("soon")}
              </GlassChip>
            </GlassButton>
          </>
        }
        className="mb-10"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("statCourses")}
          value={courses.length}
          icon={<BookIcon size={18} />}
        />
        <StatCard
          label={t("statPublished")}
          value={published}
          icon={<CheckIcon size={18} />}
        />
        <StatCard
          label={t("statDrafts")}
          value={drafts}
          icon={<PencilIcon size={18} />}
        />
        <StatCard
          label={t("statGroups")}
          value={teachingGroups.length}
          icon={<UsersIcon size={18} />}
        />
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* My courses */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-xl tracking-tight text-text md:text-2xl">
              {t("myCoursesTitle")}
            </h2>
            <GlassButton asChild variant="ghost" size="sm">
              <Link href="/admin/courses">{t("manageAll")} →</Link>
            </GlassButton>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              icon={<BookIcon size={20} />}
              title={t("noCourses")}
              description={t("noCoursesDesc")}
              action={
                <GlassButton asChild variant="primary">
                  <Link href="/admin/courses/new">
                    <PlusIcon size={14} />
                    {t("newCourse")}
                  </Link>
                </GlassButton>
              }
            />
          ) : (
            <ul className="space-y-3">
              {recent.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <AuthoredCourse course={c} locale={locale} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Teaching groups + settings peek */}
        <section className="space-y-8">
          <div>
            <h2 className="mb-4 font-display text-xl tracking-tight text-text md:text-2xl">
              {t("groupsTitle")}
            </h2>
            {teachingGroups.length === 0 ? (
              <GlassCard
                variant="plain"
                className="p-6 text-center text-text-soft"
              >
                {t("noGroups")}
              </GlassCard>
            ) : (
              <ul className="space-y-2">
                {teachingGroups.map((g) => (
                  <li key={g.id}>
                    <GlassCard variant="default">
                      <GlassCardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <div className="truncate font-medium text-text">
                            {g.name}
                          </div>
                          <div className="text-[0.8rem] text-muted">
                            {g.slug}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[0.85rem]">
                          <Link
                            href={`/admin/groups/${g.id}/curriculum`}
                            className="text-[color:var(--color-accent)] hover:underline"
                          >
                            {t("curriculumLink")} →
                          </Link>
                          <span aria-hidden className="text-muted">
                            ·
                          </span>
                          <Link
                            href={`/admin/groups/${g.id}/members`}
                            className="text-[color:var(--color-accent)] hover:underline"
                          >
                            {t("membersLink")} →
                          </Link>
                        </div>
                      </GlassCardContent>
                    </GlassCard>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {settings && (
            <div>
              <h2 className="mb-4 font-display text-xl tracking-tight text-text md:text-2xl">
                {t("settingsTitle")}
              </h2>
              <GlassCard variant="default">
                <GlassCardContent className="flex items-center justify-between gap-3 p-5">
                  <span className="text-[0.9rem] text-text-soft">
                    {t("maxBlocks")}
                  </span>
                  <span className="font-display text-[1.6rem] text-text">
                    {settings.maxBlocksPerPage}
                  </span>
                </GlassCardContent>
              </GlassCard>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

function AuthoredCourse({
  course,
  locale,
}: {
  course: CourseSummary;
  locale: "fr" | "en";
}) {
  return (
    <Link
      href={`/admin/courses/${course.id}`}
      className="block focus-visible:outline-none"
    >
      <GlassCard variant="default" interactive>
        <GlassCardContent className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
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
          <PencilIcon
            size={16}
            className="hidden shrink-0 text-muted sm:block"
          />
        </GlassCardContent>
      </GlassCard>
    </Link>
  );
}
