import { redirect } from "next/navigation";

import { requireAuth } from "@/components/admin/role-guard";
import { isAdmin, isStaff } from "@/lib/roles";

/**
 * Role dispatcher — the single source of truth for "where does a logged-in
 * user land". Post-login and the public "/" send authenticated users here.
 *   ADMIN / SUPER_ADMIN → /admin
 *   TEACHER             → /studio
 *   STUDENT             → /learn
 */
export default async function DashboardPage() {
  const me = await requireAuth();

  if (isAdmin(me.role)) redirect("/admin");
  if (isStaff(me.role)) redirect("/studio");
  redirect("/learn");
}
