import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { getPublishedCourses } from "@/app/actions/courses";
import { getCurriculum, getMyGroups } from "@/app/actions/groups";
import { requireAuth } from "@/components/admin/role-guard";
import { CatalogGrid } from "@/components/course/catalog-grid";
import { PageHeader } from "@/components/course/page-header";
import { StudentShell } from "@/components/course/student-shell";
import type { CourseSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Catalogue" };

export default async function CoursesCatalogPage() {
  await requireAuth();
  const locale = (await getLocale()) as "fr" | "en";
  const [t, published, groups] = await Promise.all([
    getTranslations("catalog"),
    getPublishedCourses(),
    getMyGroups(),
  ]);

  const curricula = await Promise.all(groups.map((g) => getCurriculum(g.id)));
  const groupCourses = new Map<string, CourseSummary>();
  for (const list of curricula) {
    for (const c of list) groupCourses.set(c.id, c);
  }

  const all = new Map<string, CourseSummary>();
  for (const c of [...published, ...groupCourses.values()]) {
    all.set(c.id, c);
  }
  const allList = [...all.values()].sort((a, b) =>
    a.title.localeCompare(b.title, locale)
  );

  return (
    <StudentShell maxWidth="wide">
      <PageHeader
        kicker={t("kicker")}
        title={t("title")}
        description={t("description")}
        className="mb-10"
      />
      <CatalogGrid
        allCourses={allList}
        groupCourseIds={[...groupCourses.keys()]}
        locale={locale}
      />
    </StudentShell>
  );
}
