import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
  getAllCourses,
  getCourseBlocks,
  getMyAuthoredCourses,
} from "@/app/actions/courses";
import { AdminBreadcrumb, AdminShell } from "@/components/admin/admin-shell";
import { BlocksEditor } from "@/components/admin/blocks-editor";
import { requireRole } from "@/components/admin/role-guard";
import { PageHeader } from "@/components/course/page-header";
import { GlassButton } from "@/components/ui/glass-button";
import { EyeIcon } from "@/components/ui/icons";
import { isAdmin } from "@/lib/roles";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Édition contenu" };

export default async function CourseBlocksPage({ params }: PageProps) {
  const me = await requireRole("TEACHER");
  const { id } = await params;
  const admin = isAdmin(me.role);
  const tAdmin = await getTranslations("admin");
  const t = await getTranslations("admin.blocksEditor");

  const list = admin ? await getAllCourses() : await getMyAuthoredCourses();
  const course = list.find((c) => c.id === id);
  if (!course) notFound();

  const blocks = await getCourseBlocks(course.id);
  const sorted = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);

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
        actions={
          <GlassButton asChild variant="ghost">
            <Link href={`/courses/${course.slug}/read`} target="_blank">
              <EyeIcon size={14} />
              {t("preview")}
            </Link>
          </GlassButton>
        }
        className="mb-8"
      />

      <BlocksEditor
        courseId={course.id}
        initialBlocks={sorted}
        cancelHref={`/admin/courses/${course.id}`}
        labels={{
          addBlock: t("addBlock"),
          kind: t("kind"),
          moveUp: t("moveUp"),
          moveDown: t("moveDown"),
          remove: t("remove"),
          save: t("save"),
          cancel: t("cancel"),
          saved: t("saved"),
          empty: t("empty"),
          emptyError: t("emptyError"),
          fieldText: t("fieldText"),
          fieldCode: t("fieldCode"),
          fieldLanguage: t("fieldLanguage"),
          fieldSrc: t("fieldSrc"),
          fieldAlt: t("fieldAlt"),
          fieldTone: t("fieldTone"),
          fieldQuestion: t("fieldQuestion"),
          fieldOptions: t("fieldOptions"),
          fieldOptionsHelper: t("fieldOptionsHelper"),
          toneNeutral: t("toneNeutral"),
          toneWarning: t("toneWarning"),
          toneDanger: t("toneDanger"),
        }}
      />
    </AdminShell>
  );
}
