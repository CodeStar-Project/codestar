// Group hub — quick links to members/curriculum and the invitations panel.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getGroup, getInvitations, getMyGroups } from "@/app/actions/groups";
import { AdminBreadcrumb, AdminShell } from "@/components/admin/admin-shell";
import { InvitationsPanel } from "@/components/admin/invitations-panel";
import { requireRole } from "@/components/admin/role-guard";
import { PageHeader } from "@/components/course/page-header";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { isAdmin } from "@/lib/roles";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Groupe" };

export default async function GroupHubPage({ params }: PageProps) {
  const me = await requireRole("TEACHER");
  const { id } = await params;
  const admin = isAdmin(me.role);
  const t = await getTranslations("admin.groups");

  let groupName: string | null = null;
  if (admin) {
    const g = await getGroup(id);
    groupName = g?.name ?? null;
  } else {
    const mine = await getMyGroups();
    groupName = mine.find((g) => g.id === id)?.name ?? null;
  }
  if (!groupName) notFound();

  const invitations = await getInvitations(id);

  return (
    <AdminShell>
      <AdminBreadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: t("title"), href: "/admin/groups" },
          { label: groupName },
        ]}
      />
      <PageHeader
        kicker={t("hub.kicker", { name: groupName })}
        title={groupName}
        className="mb-8"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href={`/admin/groups/${id}/members`} className="block">
          <GlassCard variant="default" interactive className="h-full">
            <GlassCardContent className="flex flex-col gap-1 p-5">
              <p className="font-semibold text-text">{t("members")}</p>
              <p className="text-sm text-text-soft">{t("hub.membersDesc")}</p>
            </GlassCardContent>
          </GlassCard>
        </Link>

        <Link href={`/admin/groups/${id}/curriculum`} className="block">
          <GlassCard variant="default" interactive className="h-full">
            <GlassCardContent className="flex flex-col gap-1 p-5">
              <p className="font-semibold text-text">{t("curriculum")}</p>
              <p className="text-sm text-text-soft">{t("hub.curriculumDesc")}</p>
            </GlassCardContent>
          </GlassCard>
        </Link>
      </div>

      <InvitationsPanel
        groupId={id}
        initialInvitations={invitations}
        labels={{
          invitationsTitle: t("hub.invitationsTitle"),
          invitationsDesc: t("hub.invitationsDesc"),
          newInvitation: t("hub.newInvitation"),
          invitationFormMaxUses: t("hub.invitationFormMaxUses"),
          invitationFormExpiresAt: t("hub.invitationFormExpiresAt"),
          invitationFormCreate: t("hub.invitationFormCreate"),
          code: t("hub.code"),
          uses: t("hub.uses"),
          expires: t("hub.expires"),
          noExpiry: t("hub.noExpiry"),
          noInvitations: t("hub.noInvitations"),
          copyCode: t("hub.copyCode"),
          createError: t("hub.createError"),
        }}
      />
    </AdminShell>
  );
}
