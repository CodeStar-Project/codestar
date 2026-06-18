import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AdminBreadcrumb, AdminShell } from "@/components/admin/admin-shell";
import { AiGeneratorForm } from "@/components/admin/ai-generator-form";
import { requireRole } from "@/components/admin/role-guard";
import { PageHeader } from "@/components/course/page-header";
import { SparklesIcon } from "@/components/ui/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("adminAi");
  return { title: t("title") };
}

export default async function AiGeneratorPage() {
  await requireRole("TEACHER");
  const t = await getTranslations("adminAi");

  return (
    <AdminShell>
      <AdminBreadcrumb
        items={[
          { label: t("breadcrumbAdmin"), href: "/admin" },
          { label: t("title") },
        ]}
      />
      <PageHeader
        kicker={t("kicker")}
        title={t("title")}
        description={t("description")}
        actions={<SparklesIcon size={24} className="text-accent opacity-70" />}
        className="mb-10"
      />
      <AiGeneratorForm />
    </AdminShell>
  );
}
