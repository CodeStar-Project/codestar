import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AdminBreadcrumb, AdminShell } from "@/components/admin/admin-shell";
import { CourseForm } from "@/components/admin/course-form";
import { requireRole } from "@/components/admin/role-guard";
import { PageHeader } from "@/components/course/page-header";

export const metadata: Metadata = { title: "Nouveau cours" };

export default async function NewCoursePage() {
  await requireRole("TEACHER");
  const t = await getTranslations("admin.courseForm");

  return (
    <AdminShell>
      <AdminBreadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: t("kicker"), href: "/admin/courses" },
          { label: t("createTitle") },
        ]}
      />
      <PageHeader
        kicker={t("kicker")}
        title={t("createTitle")}
        className="mb-8"
      />
      <div className="max-w-2xl">
        <CourseForm
          labels={{
            title: t("title"),
            titlePlaceholder: t("titlePlaceholder"),
            slug: t("slug"),
            slugHelper: t("slugHelper"),
            slugPlaceholder: t("slugPlaceholder"),
            description: t("description"),
            category: t("category"),
            categoryPlaceholder: t("categoryPlaceholder"),
            level: t("level"),
            levelEmpty: t("levelEmpty"),
            levelBeginner: t("levelBeginner"),
            levelIntermediate: t("levelIntermediate"),
            levelAdvanced: t("levelAdvanced"),
            submitCreate: t("submitCreate"),
            submitUpdate: t("submitUpdate"),
            cancel: t("cancel"),
            required: t("required"),
          }}
        />
      </div>
    </AdminShell>
  );
}
