import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import {
  getAllCourses,
  getMyAuthoredCourses,
  getPublishedCourses,
} from "@/app/actions/courses";
import { getCurriculum, getGroup, getMyGroups } from "@/app/actions/groups";
import { AdminBreadcrumb, AdminShell } from "@/components/admin/admin-shell";
import { CurriculumPicker } from "@/components/admin/curriculum-picker";
import { requireRole } from "@/components/admin/role-guard";
import { PageHeader } from "@/components/course/page-header";
import { isAdmin } from "@/lib/roles";
import type { CourseSummary } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Curriculum" };

export default async function CurriculumPage({ params }: PageProps) {
  const me = await requireRole("TEACHER");
  const { id } = await params;
  const admin = isAdmin(me.role);
  const locale = (await getLocale()) as "fr" | "en";
  const t = await getTranslations("admin.curriculum");

  const groupName = await resolveGroupName(id, admin);
  if (!groupName) notFound();

  const [current, allList] = await Promise.all([
    getCurriculum(id),
    admin ? getAllCourses() : mergeForTeacher(),
  ]);

  const merged = new Map<string, CourseSummary>();
  for (const c of [...allList, ...current]) merged.set(c.id, c);
  const allCourses = [...merged.values()].sort((a, b) =>
    a.title.localeCompare(b.title, locale)
  );

  return (
    <AdminShell>
      <AdminBreadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Groupes", href: "/admin/groups" },
          { label: groupName, href: `/admin/groups/${id}` },
          { label: t("title") },
        ]}
      />
      <PageHeader
        kicker={t("kicker", { group: groupName })}
        title={t("title")}
        description={t("description")}
        className="mb-8"
      />
      <CurriculumPicker
        groupId={id}
        initialSelected={current}
        allCourses={allCourses}
        labels={{
          searchPlaceholder: t("searchPlaceholder"),
          selected: t("selected"),
          available: t("available"),
          empty: t("empty"),
          emptyAvailable: t("emptyAvailable"),
          save: t("save"),
          cancel: t("cancel"),
          saved: t("saved"),
        }}
        cancelHref="/admin"
        locale={locale}
      />
    </AdminShell>
  );
}

async function resolveGroupName(id: string, admin: boolean): Promise<string | null> {
  if (admin) {
    const g = await getGroup(id);
    return g?.name ?? null;
  }
  const mine = await getMyGroups();
  return mine.find((g) => g.id === id)?.name ?? null;
}

async function mergeForTeacher(): Promise<CourseSummary[]> {
  const [pub, mine] = await Promise.all([
    getPublishedCourses(),
    getMyAuthoredCourses(),
  ]);
  const map = new Map<string, CourseSummary>();
  for (const c of [...pub, ...mine]) map.set(c.id, c);
  return [...map.values()];
}
