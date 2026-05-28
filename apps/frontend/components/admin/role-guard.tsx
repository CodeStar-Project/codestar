import { redirect } from "next/navigation";

import { getMe } from "@/app/actions/auth";
import { isAtLeast } from "@/lib/roles";
import type { MeResponse, Role } from "@/lib/types";

/**
 * Server-side role gate. Redirects unauthenticated users to /login,
 * insufficient roles to "/".
 * Returns the resolved user when access is granted.
 */
export async function requireRole(min: Role): Promise<MeResponse> {
  const me = await getMe();
  if (!me) redirect("/login");
  if (!isAtLeast(me.role, min)) redirect("/");
  return me;
}

export async function requireAuth(): Promise<MeResponse> {
  const me = await getMe();
  if (!me) redirect("/login");
  return me;
}
