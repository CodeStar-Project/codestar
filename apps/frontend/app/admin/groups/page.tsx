import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getAllGroups, getMyGroups } from "@/app/actions/groups";
import { AdminBreadcrumb, AdminShell } from "@/components/admin/admin-shell";
import { CreateGroupTrigger } from "@/components/admin/create-group-trigger";
import { GroupsGrid } from "@/components/admin/groups-grid";
import { requireRole } from "@/components/admin/role-guard";
import { PageHeader } from "@/components/course/page-header";
import { isAdmin } from "@/lib/roles";

export const metadata: Metadata = { title: "Groupes" };

export default async function GroupsPage() {
  const me = await requireRole("TEACHER");
  const admin = isAdmin(me.role);
  const t = await getTranslations("admin.groups");

  const groups = admin ? await getAllGroups() : await getMyGroups();

  return (
    <AdminShell>
      <AdminBreadcrumb
        items={[{ label: "Admin", href: "/admin" }, { label: t("title") }]}
      />
      <PageHeader
        kicker={t("kicker")}
        title={t("title")}
        description={t("description")}
        actions={
          admin ? (
            <CreateGroupTrigger
              newGroup={t("newGroup")}
              form={{
                title: t("form.title"),
                name: t("form.name"),
                namePlaceholder: t("form.namePlaceholder"),
                slug: t("form.slug"),
                slugPlaceholder: t("form.slugPlaceholder"),
                slugHelper: t("form.slugHelper"),
                startsAt: t("form.startsAt"),
                endsAt: t("form.endsAt"),
                create: t("form.create"),
                cancel: t("form.cancel"),
              }}
            />
          ) : null
        }
        className="mb-8"
      />
      <GroupsGrid
        groups={groups}
        isAdmin={admin}
        labels={{
          members: t("members"),
          curriculum: t("curriculum"),
          deleteConfirm: t("deleteConfirm"),
          deleteBtn: t("deleteBtn"),
          empty: t("empty"),
        }}
      />
    </AdminShell>
  );
}
