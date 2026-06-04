import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getSettings } from "@/app/actions/settings";
import { AdminBreadcrumb, AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/components/admin/role-guard";
import { SettingsForm } from "@/components/admin/settings-form";
import { PageHeader } from "@/components/course/page-header";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("adminSettings");
  return { title: t("title") };
}

export default async function AdminSettingsPage() {
  await requireRole("ADMIN");
  const t = await getTranslations("adminSettings");
  const settings = await getSettings();

  return (
    <AdminShell>
      <AdminBreadcrumb
        items={[{ label: "Admin", href: "/admin" }, { label: t("title") }]}
      />
      <PageHeader kicker={t("kicker")} title={t("title")} description={t("description")} className="mb-8" />

      <GlassCard variant="default">
        <GlassCardContent className="p-6">
          <h2 className="mb-4 font-display text-[1.2rem] text-text">
            {t("courseBuilderSection")}
          </h2>
          <SettingsForm initialMaxBlocksPerPage={settings?.maxBlocksPerPage ?? 50} />
        </GlassCardContent>
      </GlassCard>
    </AdminShell>
  );
}
