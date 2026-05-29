import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { getGroup, getGroupMembers, getMyGroups } from "@/app/actions/groups";
import { AdminBreadcrumb, AdminShell } from "@/components/admin/admin-shell";
import { GroupCardActions } from "@/components/admin/group-card-actions";
import { MembersTable } from "@/components/admin/members-table";
import { requireRole } from "@/components/admin/role-guard";
import { PageHeader } from "@/components/course/page-header";
import { isAdmin } from "@/lib/roles";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Membres" };

export default async function GroupMembersPage({ params }: PageProps) {
  const me = await requireRole("TEACHER");
  const { id } = await params;
  const admin = isAdmin(me.role);
  const locale = (await getLocale()) as "fr" | "en";
  const t = await getTranslations("admin.members");
  const tAdmin = await getTranslations("admin");
  const tRoles = await getTranslations("groupMemberRoles");
  const tErrors = await getTranslations("errors");

  let groupName: string | null = null;
  if (admin) {
    const g = await getGroup(id);
    groupName = g?.name ?? null;
  } else {
    const mine = await getMyGroups();
    groupName = mine.find((g) => g.id === id)?.name ?? null;
  }
  if (!groupName) notFound();

  const members = await getGroupMembers(id);

  return (
    <AdminShell>
      <AdminBreadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: groupName },
          { label: t("title") },
        ]}
      />
      <PageHeader
        kicker={t("kicker", { group: groupName })}
        title={t("title")}
        description={t("description")}
        actions={
          <GroupCardActions
            groupId={id}
            groupName={groupName}
            canDelete={admin}
            labels={{
              exportCsv: tAdmin("exportCsvShort"),
              delete: tAdmin("deleteGroup"),
              confirmDelete: tAdmin("confirmDeleteGroup"),
            }}
          />
        }
        className="mb-8"
      />
      <MembersTable
        groupId={id}
        initialMembers={members}
        currentUserId={me.id}
        labels={{
          searchPlaceholder: t("searchPlaceholder"),
          promoteToTeacher: t("promoteToTeacher"),
          demoteToStudent: t("demoteToStudent"),
          remove: t("remove"),
          confirmRemove: t("confirmRemove"),
          empty: t("empty"),
          errorUnknown: tErrors("unknown"),
          columns: {
            user: t("columns.user"),
            roleInGroup: t("columns.roleInGroup"),
            joinedAt: t("columns.joinedAt"),
            actions: t("columns.actions"),
          },
          groupRoles: {
            STUDENT: tRoles("STUDENT"),
            TEACHER: tRoles("TEACHER"),
          },
        }}
        locale={locale}
      />
    </AdminShell>
  );
}
