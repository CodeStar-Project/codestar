// Admin settings page — loads branding + platform settings, renders the editor.

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getInstanceBranding } from "@/app/actions/instance";
import { getSettings } from "@/app/actions/settings";
import { AdminBreadcrumb, AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/components/admin/role-guard";
import { SettingsForm } from "@/components/admin/settings-form";
import { SettingsWorkspace } from "@/components/admin/settings/settings-workspace";
import { PageHeader } from "@/components/course/page-header";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import type { InstanceSettings } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("adminSettings");
  return { title: t("title") };
}

/** Safe defaults if the backend hasn't persisted settings yet. */
const FALLBACK_SETTINGS: InstanceSettings = {
  signupOpen: true,
  mediaUserQuotaMb: 100,
  mediaInstanceQuotaMb: 5000,
  aiApiUrl: "",
  aiModel: "",
  aiMaxTokens: 4096,
  aiTemperature: 0.7,
  aiApiKeySet: false,
};

export default async function AdminSettingsPage() {
  await requireRole("ADMIN");
  const t = await getTranslations("adminSettings");

  const [branding, settings] = await Promise.all([
    getInstanceBranding(),
    getSettings(),
  ]);

  return (
    <AdminShell>
      <AdminBreadcrumb
        items={[{ label: "Admin", href: "/admin" }, { label: t("title") }]}
      />
      <PageHeader
        kicker={t("kicker")}
        title={t("title")}
        description={t("description")}
        className="mb-8"
      />

      <SettingsWorkspace
        initialBranding={branding}
        initialSettings={settings ?? FALLBACK_SETTINGS}
      />

      {/* Course builder settings (kept from the existing settings page). */}
      <GlassCard variant="default" className="mt-6">
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
