import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
  getAllCourses,
  getCoursePages,
  getMyAuthoredCourses,
} from "@/app/actions/courses";
import { getSettings } from "@/app/actions/settings";
import { AdminBreadcrumb, AdminShell } from "@/components/admin/admin-shell";
import { CourseEditor } from "@/components/admin/course-editor";
import { requireRole } from "@/components/admin/role-guard";
import { PageHeader } from "@/components/course/page-header";
import { isAdmin } from "@/lib/roles";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("courseBuilder");
  return { title: t("title") };
}

export default async function CourseBlocksPage({ params }: PageProps) {
  const me = await requireRole("TEACHER");
  const { id } = await params;
  const admin = isAdmin(me.role);
  const tAdmin = await getTranslations("admin");
  const t = await getTranslations("courseBuilder");

  const list = admin ? await getAllCourses() : await getMyAuthoredCourses();
  const course = list.find((c) => c.id === id);
  if (!course) notFound();

  const [pages, settings] = await Promise.all([
    getCoursePages(course.id),
    getSettings(),
  ]);
  const sortedPages = [...pages]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((p) => ({
      ...p,
      blocks: [...p.blocks].sort((a, b) => a.orderIndex - b.orderIndex),
    }));
  const maxBlocksPerPage = settings?.maxBlocksPerPage ?? 50;

  return (
    <AdminShell>
      <AdminBreadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: tAdmin("recentTitle"), href: "/admin/courses" },
          { label: course.title, href: `/admin/courses/${course.id}` },
          { label: t("title") },
        ]}
      />

      <PageHeader
        kicker={course.title}
        title={t("title")}
        description={t("description")}
        className="mb-8"
      />

      <CourseEditor
        courseId={course.id}
        courseSlug={course.slug}
        initialTitle={course.title}
        initialStatus={course.status}
        initialPages={sortedPages}
        maxBlocksPerPage={maxBlocksPerPage}
        previewHref={`/courses/${course.slug}/read`}
      />
    </AdminShell>
  );
}
