import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { getInstanceBranding } from "@/app/actions/instance";
import { getAllCourses } from "@/app/actions/courses";
import { getAllGroups } from "@/app/actions/groups";
import { getSettings } from "@/app/actions/settings";
import { getAllUsers } from "@/app/actions/users";
import { AdminShell } from "@/components/admin/admin-shell";
import { GroupCardActions } from "@/components/admin/group-card-actions";
import { requireRole } from "@/components/admin/role-guard";
import { CourseMeta } from "@/components/course/course-meta";
import { PageHeader } from "@/components/course/page-header";
import { StatCard } from "@/components/course/stat-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { GlassChip } from "@/components/ui/glass-chip";
import {
  BookIcon,
  ChartIcon,
  PlusIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { isSuperAdmin } from "@/lib/roles";
import type { CourseSummary, GroupResponse, Role } from "@/lib/types";

export const metadata: Metadata = { title: "Admin" };

const ROLE_ORDER: Role[] = ["STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"];

/** Module-scope (not a component) so the `now` read stays out of render. */
function countActiveGroups(groups: GroupResponse[]): number {
  const now = Date.now();
  return groups.filter(
    (g) => !g.endsAt || new Date(g.endsAt).getTime() >= now
  ).length;
}

export default async function AdminDashboardPage() {
  const me = await requireRole("ADMIN");
  const superAdmin = isSuperAdmin(me.role);
  const locale = (await getLocale()) as "fr" | "en";

  const [t, tRoles, branding, courses, groups, users, settings] =
    await Promise.all([
      getTranslations("admin"),
      getTranslations("roles"),
      getInstanceBranding(),
      getAllCourses(),
      getAllGroups(),
      getAllUsers(),
      getSettings(),
    ]);

  const published = courses.filter((c) => c.status === "PUBLISHED").length;
  const drafts = courses.filter((c) => c.status === "DRAFT").length;
  const archived = courses.filter((c) => c.status === "ARCHIVED").length;

  const activeGroups = countActiveGroups(groups);

  const disabledUsers = users.filter((u) => u.disabledAt).length;
  const usersByRole = ROLE_ORDER.map((r) => ({
    role: r,
    count: users.filter((u) => u.role === r).length,
  }));
  const maxRoleCount = Math.max(1, ...usersByRole.map((x) => x.count));

  const recent = [...courses].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <AdminShell>
      <PageHeader
        kicker={t("kicker", { name: branding.name })}
        title={t("title")}
        actions={
          <>
            <GlassButton asChild variant="glass">
              <Link href="/admin/ai-generator">
                <SparklesIcon size={14} />
                AI Generator
              </Link>
            </GlassButton>
            <GlassButton asChild variant="primary">
              <Link href="/admin/courses/new">
                <PlusIcon size={14} />
                {t("newCourse")}
              </Link>
            </GlassButton>
            <GlassButton asChild variant="ghost">
              <Link href="/admin/users">{t("usersLink")}</Link>
            </GlassButton>
            <GlassButton asChild variant="ghost">
              <Link href="/admin/settings">{t("settingsLink")}</Link>
            </GlassButton>
          </>
        }
        className="mb-10"
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("stats.totalCourses")}
          value={courses.length}
          hint={t("kpi.publishedDrafts", { published, drafts })}
          icon={<BookIcon size={18} />}
        />
        <StatCard
          label={t("stats.published")}
          value={published}
          icon={<ChartIcon size={18} />}
        />
        <StatCard
          label={t("kpi.users")}
          value={users.length}
          hint={t("kpi.disabled", { count: disabledUsers })}
          icon={<UsersIcon size={18} />}
        />
        <StatCard
          label={t("stats.groups")}
          value={groups.length}
          hint={t("kpi.active", { count: activeGroups })}
          icon={<UsersIcon size={18} />}
        />
      </div>

      {/* Catalog health + users by role */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <GlassCard variant="default">
          <GlassCardContent className="p-6">
            <h2 className="mb-4 font-display text-xl text-text">
              {t("kpi.catalogHealth")}
            </h2>
            <div className="space-y-3">
              <CatalogBar
                label={t("kpi.published")}
                value={published}
                total={courses.length}
                tone="var(--color-success)"
              />
              <CatalogBar
                label={t("kpi.drafts")}
                value={drafts}
                total={courses.length}
                tone="var(--color-warning)"
              />
              <CatalogBar
                label={t("kpi.archived")}
                value={archived}
                total={courses.length}
                tone="var(--color-muted)"
              />
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="default">
          <GlassCardContent className="p-6">
            <h2 className="mb-4 font-display text-xl text-text">
              {t("kpi.usersByRole")}
            </h2>
            <ul className="space-y-3">
              {usersByRole.map(({ role, count }) => (
                <li key={role} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-[0.85rem] text-text-soft">
                    {tRoles(role)}
                  </span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[color:var(--color-accent-soft)]">
                    <span
                      className="block h-full rounded-full bg-[color:var(--color-accent)]"
                      style={{ width: `${(count / maxRoleCount) * 100}%` }}
                    />
                  </span>
                  <span className="w-8 text-right font-mono text-[0.82rem] text-text">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Super-admin instance block */}
      {superAdmin && (
        <section className="mt-6">
          <GlassCard variant="tinted">
            <GlassCardContent className="flex flex-wrap items-center justify-between gap-6 p-6">
              <div className="flex items-center gap-4">
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-[color:var(--color-accent)]"
                  style={{ background: "var(--color-accent-soft)" }}
                  aria-hidden
                >
                  <SparklesIcon size={22} />
                </span>
                <div>
                  <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                    {t("superAdmin.kicker")}
                  </div>
                  <h2 className="font-display text-xl text-text">
                    {t("superAdmin.title", { name: branding.name })}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.85rem] text-text-soft">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-[color:var(--glass-border)]"
                        style={{ background: branding.accent }}
                        aria-hidden
                      />
                      {branding.accent}
                    </span>
                    <span aria-hidden>·</span>
                    <GlassChip variant="default" size="sm">
                      {branding.locale.toUpperCase()}
                    </GlassChip>
                    {settings && (
                      <>
                        <span aria-hidden>·</span>
                        <span>
                          {t("superAdmin.maxBlocks", {
                            n: settings.maxBlocksPerPage,
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <GlassButton asChild variant="glass" size="sm">
                  <Link href="/admin/settings">{t("settingsLink")}</Link>
                </GlassButton>
                <GlassButton asChild variant="glass" size="sm">
                  <Link href="/admin/users">{t("superAdmin.manageRoles")}</Link>
                </GlassButton>
              </div>
            </GlassCardContent>
          </GlassCard>
        </section>
      )}

      {/* Recent courses + groups */}
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
            {recent.slice(0, 5).map((c) => (
              <li key={c.id}>
                <RecentCourse course={c} locale={locale} />
              </li>
            ))}
            {recent.length === 0 && (
              <GlassCard
                variant="plain"
                className="p-6 text-center text-text-soft"
              >
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
            <GlassCard
              variant="plain"
              className="p-6 text-center text-text-soft"
            >
              {t("noGroups")}
            </GlassCard>
          ) : (
            <ul className="space-y-2">
              {groups.map((g) => (
                <li key={g.id}>
                  <GlassCard variant="default">
                    <GlassCardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <div className="font-medium text-text">{g.name}</div>
                        <div className="text-[0.82rem] text-muted">
                          {g.slug}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[0.85rem]">
                        <Link
                          href={`/admin/groups/${g.id}/curriculum`}
                          className="text-[color:var(--color-accent)] hover:underline"
                        >
                          {t("groupsManage")} →
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
                        <GroupCardActions
                          groupId={g.id}
                          groupName={g.name}
                          canDelete
                          labels={{
                            exportCsv: t("exportCsvShort"),
                            delete: t("deleteGroup"),
                            confirmDelete: t("confirmDeleteGroup"),
                          }}
                        />
                      </div>
                    </GlassCardContent>
                  </GlassCard>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

function CatalogBar({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-[0.85rem] text-text-soft">
        {label}
      </span>
      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[color:var(--glass-bg-strong)]">
        <span
          className="block h-full rounded-full"
          style={{ width: `${pct}%`, background: tone }}
        />
      </span>
      <span className="w-8 text-right font-mono text-[0.82rem] text-text">
        {value}
      </span>
    </div>
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
