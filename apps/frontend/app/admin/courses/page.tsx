import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { getAllCourses, getMyAuthoredCourses } from "@/app/actions/courses";
import { getInstanceBranding } from "@/app/actions/instance";
import { AdminShell } from "@/components/admin/admin-shell";
import { CourseRowActions } from "@/components/admin/course-row-actions";
import { requireRole } from "@/components/admin/role-guard";
import { CourseMeta } from "@/components/course/course-meta";
import { EmptyState } from "@/components/course/empty-state";
import { PageHeader } from "@/components/course/page-header";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { BookIcon, PlusIcon } from "@/components/ui/icons";
import { formatDate, levelLabel, statusLabel } from "@/lib/format";
import { isAdmin } from "@/lib/roles";

export const metadata: Metadata = { title: "Cours" };

export default async function AdminCoursesPage() {
  const me = await requireRole("TEACHER");
  const admin = isAdmin(me.role);
  const locale = (await getLocale()) as "fr" | "en";
  const [t, branding, courses] = await Promise.all([
    getTranslations("admin"),
    getInstanceBranding(),
    admin ? getAllCourses() : getMyAuthoredCourses(),
  ]);
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
        title={t("recentTitle")}
        actions={
          <GlassButton asChild variant="primary">
            <Link href="/admin/courses/new">
              <PlusIcon size={14} /> {t("newCourse")}
            </Link>
          </GlassButton>
        }
        className="mb-10"
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={<BookIcon size={22} />}
          title={t("table.empty")}
          action={
            <GlassButton asChild variant="primary">
              <Link href="/admin/courses/new">
                <PlusIcon size={14} /> {t("newCourse")}
              </Link>
            </GlassButton>
          }
        />
      ) : (
        <GlassCard variant="plain" className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.92rem]">
              <thead className="border-b border-[color:var(--glass-border)] text-[0.72rem] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("table.title")}</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">
                    {t("table.category")}
                  </th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">
                    {t("table.level")}
                  </th>
                  <th className="px-4 py-3 font-medium">{t("table.status")}</th>
                  {admin && (
                    <th className="hidden px-4 py-3 font-medium lg:table-cell">
                      {t("table.author")}
                    </th>
                  )}
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">
                    {t("table.updated")}
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--glass-border)]">
                {sorted.map((c) => (
                  <tr key={c.id} className="align-middle">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/courses/${c.id}`}
                        className="font-medium text-text hover:text-[color:var(--color-accent)]"
                      >
                        {c.title}
                      </Link>
                      <div className="mt-1 md:hidden">
                        <CourseMeta
                          category={c.category}
                          level={c.level}
                          locale={locale}
                          size="sm"
                        />
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-text-soft md:table-cell">
                      {c.category ?? "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-text-soft md:table-cell">
                      {levelLabel(c.level, locale) || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-text-soft">
                        {statusLabel(c.status, locale)}
                      </span>
                    </td>
                    {admin && (
                      <td className="hidden px-4 py-3 text-text-soft lg:table-cell">
                        {c.authorName ?? "—"}
                      </td>
                    )}
                    <td className="hidden px-4 py-3 text-muted sm:table-cell">
                      {formatDate(c.updatedAt, locale)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <CourseRowActions
                        course={c}
                        labels={{
                          edit: t("table.edit"),
                          publish: t("table.publish"),
                          unpublish: t("table.unpublish"),
                          archive: t("table.archive"),
                          delete: t("table.delete"),
                          duplicate: t("table.duplicate"),
                          confirmDelete: t("table.confirmDelete"),
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </AdminShell>
  );
}
