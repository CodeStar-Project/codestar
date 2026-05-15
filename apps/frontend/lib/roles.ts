/**
 * Frontend role hierarchy helpers.
*/

import type { Role } from "./types";

const PRIVILEGE_LEVEL: Record<Role, number> = {
  STUDENT: 10,
  TEACHER: 20,
  ADMIN: 30,
  SUPER_ADMIN: 40,
};

export function isAtLeast(
  actual: Role | undefined | null,
  required: Role
): boolean {
  if (!actual) return false;
  return PRIVILEGE_LEVEL[actual] >= PRIVILEGE_LEVEL[required];
}

export function isStaff(role: Role | undefined | null): boolean {
  return isAtLeast(role, "TEACHER");
}

export function isAdmin(role: Role | undefined | null): boolean {
  return isAtLeast(role, "ADMIN");
}

export function isSuperAdmin(role: Role | undefined | null): boolean {
  return role === "SUPER_ADMIN";
}

