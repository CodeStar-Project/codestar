import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { getAllUsers } from "@/app/actions/users";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/components/admin/role-guard";
import { UsersTable } from "@/components/admin/users-table";
import { PageHeader } from "@/components/course/page-header";
import type { Role } from "@/lib/types";

export const metadata: Metadata = { title: "Utilisateurs" };

const ROLE_KEYS: Role[] = ["STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"];

export default async function AdminUsersPage() {
  const me = await requireRole("ADMIN");
  const locale = (await getLocale()) as "fr" | "en";

  const [t, tRoles, users] = await Promise.all([
    getTranslations("admin.users"),
    getTranslations("roles"),
    getAllUsers(),
  ]);

  const roleLabels = Object.fromEntries(
    ROLE_KEYS.map((r) => [r, tRoles(r)])
  ) as Record<Role, string>;

  return (
    <AdminShell>
      <PageHeader
        kicker={t("kicker")}
        title={t("title")}
        description={t("description")}
        className="mb-10"
      />
      <UsersTable
        initialUsers={users}
        currentUserId={me.id}
        currentUserRole={me.role}
        labels={{
          searchPlaceholder: t("searchPlaceholder"),
          roleFilter: t("roleFilter"),
          stateFilter: t("stateFilter"),
          stateAll: t("stateAll"),
          stateActive: t("stateActive"),
          stateDisabled: t("stateDisabled"),
          promote: t("promote"),
          demote: t("demote"),
          disable: t("disable"),
          enable: t("enable"),
          confirmDisable: t("confirmDisable"),
          confirmEnable: t("confirmEnable"),
          empty: t("empty"),
          self: t("self"),
          columns: {
            user: t("columns.user"),
            role: t("columns.role"),
            state: t("columns.state"),
            createdAt: t("columns.createdAt"),
            actions: t("columns.actions"),
          },
          state: {
            active: t("state.active"),
            disabled: t("state.disabled"),
          },
          roleLabels,
        }}
        locale={locale}
      />
    </AdminShell>
  );
}
