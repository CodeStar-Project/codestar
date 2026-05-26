import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { getInstanceBranding } from "@/app/actions/instance";
import {
  getAllCourses,
  getMyAuthoredCourses,
} from "@/app/actions/courses";
import { getMyGroups, getAllGroups } from "@/app/actions/groups";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/components/admin/role-guard";
import { CourseMeta } from "@/components/course/course-meta";
import { PageHeader } from "@/components/course/page-header";
import { StatCard } from "@/components/course/stat-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
  GlassCard,
  GlassCardContent,
} from "@/components/ui/glass-card";
import {
  BookIcon,
  ChartIcon,
  PlusIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { isAdmin } from "@/lib/roles";
import type { CourseSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  const me = await requireRole("TEACHER");
  const admin = isAdmin(me.role);
  const locale = (await getLocale()) as "fr" | "en";
  const [t, branding] = await Promise.all([
    getTranslations("admin"),
    getInstanceBranding(),
  ]);

  const [courses, groups] = await Promise.all([
    admin ? getAllCourses() : getMyAuthoredCourses(),
    admin ? getAllGroups() : getMyGroups(),
  ]);

  const published = courses.filter((c) => c.status === "PUBLISHED").length;
  const drafts = courses.filter((c) => c.status === "DRAFT").length;
  const sorted = [...courses].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <AdminShell>
      <PageHeader
        kicker={
          admin
            ? t("kicker", { name: branding.name })
            : t("kickerTeacher", { name: branding.name })
        }
        title={admin ? t("title") : t("titleTeacher")}
        actions={
          <>
            <GlassButton asChild variant="primary">
              <Link href="/admin/courses/new">
                <PlusIcon size={14} />
                {t("newCourse")}
              </Link>
            </GlassButton>
            <GlassButton asChild variant="ghost">
              <Link href="/admin/courses">{t("recentTitle")}</Link>
            </GlassButton>
          </>
        }
        className="mb-10"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={admin ? t("stats.totalCourses") : t("stats.myCourses")}
          value={courses.length}
          icon={<BookIcon size={18} />}
        />
        <StatCard
          label={t("stats.published")}
          value={published}
          icon={<ChartIcon size={18} />}
        />
        <StatCard
          label={t("stats.drafts")}
          value={drafts}
          icon={<BookIcon size={18} />}
        />
        <StatCard
          label={t("stats.groups")}
          value={groups.length}
          icon={<UsersIcon size={18} />}
        />
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-xl tracking-tight text-text md:text-2xl">
              {t("recentTitle")}
            </h2>
            <GlassButton asChild variant="ghost" size="sm">
              <Link href="/admin/courses">{t("recentTitle")} →</Link>
            </GlassButton>
          </div>
          <ul className="space-y-3">
            {sorted.slice(0, 5).map((c) => (
              <li key={c.id}>
                <RecentCourse course={c} locale={locale} />
              </li>
            ))}
            {sorted.length === 0 && (
              <GlassCard variant="plain" className="p-6 text-center text-text-soft">
                {t("table.empty")}
              </GlassCard>
            )}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl tracking-tight text-text md:text-2xl">
            {t("groupsTitle")}
          </h2>
          {groups.length === 0 ? (
            <GlassCard variant="plain" className="p-6 text-center text-text-soft">
              {t("noGroups")}
            </GlassCard>
          ) : (
            <ul className="space-y-2">
              {groups.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/admin/groups/${g.id}/curriculum`}
                    className="block focus-visible:outline-none"
                  >
                    <GlassCard variant="default" interactive>
                      <GlassCardContent className="flex items-center justify-between gap-3 p-4">
                        <div>
                          <div className="font-medium text-text">{g.name}</div>
                          <div className="text-[0.82rem] text-muted">{g.slug}</div>
                        </div>
                        <span className="text-[0.85rem] text-[color:var(--color-accent)]">
                          {t("groupsManage")} →
                        </span>
                      </GlassCardContent>
                    </GlassCard>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

function RecentCourse({
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
          <span className="hidden text-[0.82rem] text-muted sm:inline">
            {new Date(course.updatedAt).toLocaleDateString(locale)}
          </span>
        </GlassCardContent>
      </GlassCard>
    </Link>
  );
}
