import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
  getAllCourses,
  getMyAuthoredCourses,
} from "@/app/actions/courses";
import { AdminBreadcrumb, AdminShell } from "@/components/admin/admin-shell";
import { CourseForm } from "@/components/admin/course-form";
import { requireRole } from "@/components/admin/role-guard";
import { PageHeader } from "@/components/course/page-header";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { isAdmin } from "@/lib/roles";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Modifier cours" };

export default async function EditCoursePage({ params }: PageProps) {
  const me = await requireRole("TEACHER");
  const { id } = await params;
  const admin = isAdmin(me.role);
  const t = await getTranslations("admin.courseForm");

  const list = admin ? await getAllCourses() : await getMyAuthoredCourses();
  const course = list.find((c) => c.id === id);
  if (!course) notFound();

  return (
    <AdminShell>
      <AdminBreadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: t("kicker"), href: "/admin/courses" },
          { label: course.title },
        ]}
      />

      <PageHeader
        kicker={t("kicker")}
        title={t("editTitle")}
        actions={
          <GlassButton asChild variant="ghost">
            <Link href={`/courses/${course.slug}`} target="_blank">
              {course.slug}
            </Link>
          </GlassButton>
        }
        className="mb-8"
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="max-w-2xl">
          <CourseForm
            course={course}
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

        <aside>
          <GlassCard variant="tinted">
            <GlassCardContent className="p-5 text-[0.9rem] text-text-soft">
              <p>{t("editNotice")}</p>
            </GlassCardContent>
          </GlassCard>
        </aside>
      </div>
    </AdminShell>
  );
}
