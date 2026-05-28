"use client";

import { useMemo, useState, useTransition } from "react";

import {
  setUserDisabled,
  updateUserRole,
  type UserSummary,
} from "@/app/actions/users";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassChip } from "@/components/ui/glass-chip";
import { GlassInput, GlassSelect } from "@/components/ui/glass-input";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLES: Role[] = ["STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"];
const PRIVILEGE: Record<Role, number> = {
  STUDENT: 10,
  TEACHER: 20,
  ADMIN: 30,
  SUPER_ADMIN: 40,
};

interface Labels {
  searchPlaceholder: string;
  roleFilter: string;
  stateFilter: string;
  stateAll: string;
  stateActive: string;
  stateDisabled: string;
  promote: string;
  demote: string;
  disable: string;
  enable: string;
  confirmDisable: string;
  confirmEnable: string;
  empty: string;
  self: string;
  columns: {
    user: string;
    role: string;
    state: string;
    createdAt: string;
    actions: string;
  };
  state: {
    active: string;
    disabled: string;
  };
  roleLabels: Record<Role, string>;
}

interface UsersTableProps {
  initialUsers: UserSummary[];
  currentUserId: string;
  currentUserRole: Role;
  labels: Labels;
  locale: "fr" | "en";
}

export function UsersTable({
  initialUsers,
  currentUserId,
  currentUserRole,
  labels,
  locale,
}: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | Role>("");
  const [stateFilter, setStateFilter] = useState<"all" | "active" | "disabled">("all");
  const [pending, start] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (stateFilter === "active" && u.disabledAt) return false;
      if (stateFilter === "disabled" && !u.disabledAt) return false;
      if (q && !u.email.toLowerCase().includes(q) && !u.displayName.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [users, query, roleFilter, stateFilter]);

  function canManage(target: UserSummary): boolean {
    if (target.id === currentUserId) return false;
    if (currentUserRole === "SUPER_ADMIN") return true;
    return PRIVILEGE[target.role] < PRIVILEGE[currentUserRole];
  }

  function nextRoleUp(role: Role): Role | null {
    const i = ROLES.indexOf(role);
    if (i < 0 || i >= ROLES.length - 1) return null;
    return ROLES[i + 1];
  }
  function nextRoleDown(role: Role): Role | null {
    const i = ROLES.indexOf(role);
    if (i <= 0) return null;
    return ROLES[i - 1];
  }

  function changeRole(user: UserSummary, newRole: Role) {
    setErrorMsg(null);
    start(async () => {
      const r = await updateUserRole(user.id, newRole);
      if (!r.ok || !r.user) {
        setErrorMsg(r.error ?? "Erreur");
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === user.id ? r.user! : u)));
    });
  }

  function toggleDisabled(user: UserSummary) {
    const willDisable = !user.disabledAt;
    const confirmMsg = willDisable ? labels.confirmDisable : labels.confirmEnable;
    if (!confirm(confirmMsg)) return;
    setErrorMsg(null);
    start(async () => {
      const r = await setUserDisabled(user.id, willDisable);
      if (!r.ok || !r.user) {
        setErrorMsg(r.error ?? "Erreur");
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === user.id ? r.user! : u)));
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <GlassInput
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="max-w-sm"
        />
        <GlassSelect
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "" | Role)}
          className="w-44"
          aria-label={labels.roleFilter}
        >
          <option value="">{labels.roleFilter}</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {labels.roleLabels[r]}
            </option>
          ))}
        </GlassSelect>
        <GlassSelect
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value as typeof stateFilter)}
          className="w-40"
          aria-label={labels.stateFilter}
        >
          <option value="all">{labels.stateAll}</option>
          <option value="active">{labels.stateActive}</option>
          <option value="disabled">{labels.stateDisabled}</option>
        </GlassSelect>
        {errorMsg && (
          <span role="alert" className="text-[0.85rem] text-[color:var(--color-danger)]">
            {errorMsg}
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <GlassCard variant="plain" className="p-10 text-center text-text-soft">
          {labels.empty}
        </GlassCard>
      ) : (
        <GlassCard variant="plain" className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.92rem]">
              <thead className="border-b border-[color:var(--glass-border)] text-[0.72rem] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">{labels.columns.user}</th>
                  <th className="px-4 py-3 font-medium">{labels.columns.role}</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">
                    {labels.columns.state}
                  </th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">
                    {labels.columns.createdAt}
                  </th>
                  <th className="px-4 py-3 text-right font-medium">{labels.columns.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--glass-border)]">
                {filtered.map((u) => {
                  const isSelf = u.id === currentUserId;
                  const manageable = canManage(u);
                  const promote = nextRoleUp(u.role);
                  const demote = nextRoleDown(u.role);
                  const canPromote =
                    manageable && promote && (currentUserRole === "SUPER_ADMIN" || PRIVILEGE[promote] < PRIVILEGE[currentUserRole]);
                  const canDemote = manageable && demote;

                  return (
                    <tr key={u.id} className="align-middle">
                      <td className="px-4 py-3">
                        <div className="font-medium text-text">
                          {u.displayName}
                          {isSelf && (
                            <GlassChip variant="accent" size="sm" className="ml-2">
                              {labels.self}
                            </GlassChip>
                          )}
                        </div>
                        <div className="text-[0.82rem] text-muted">{u.email}</div>
                      </td>
                      <td className="px-4 py-3 text-text-soft">{labels.roleLabels[u.role]}</td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        {u.disabledAt ? (
                          <GlassChip variant="danger" size="sm">
                            {labels.state.disabled}
                          </GlassChip>
                        ) : (
                          <GlassChip variant="success" size="sm">
                            {labels.state.active}
                          </GlassChip>
                        )}
                      </td>
                      <td
                        className={cn(
                          "hidden px-4 py-3 text-muted lg:table-cell",
                          !u.createdAt && "text-muted/60"
                        )}
                      >
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString(locale)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {canPromote && promote && (
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              disabled={pending}
                              onClick={() => changeRole(u, promote)}
                              aria-label={`${labels.promote} ${u.displayName}`}
                            >
                              ↑ {labels.promote}
                            </GlassButton>
                          )}
                          {canDemote && demote && (
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              disabled={pending}
                              onClick={() => changeRole(u, demote)}
                              aria-label={`${labels.demote} ${u.displayName}`}
                            >
                              ↓ {labels.demote}
                            </GlassButton>
                          )}
                          {manageable && (
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              disabled={pending}
                              onClick={() => toggleDisabled(u)}
                              className={cn(
                                "text-[color:var(--color-danger)] hover:text-[color:var(--color-danger)]",
                                u.disabledAt && "text-[color:var(--color-success)] hover:text-[color:var(--color-success)]"
                              )}
                            >
                              {u.disabledAt ? labels.enable : labels.disable}
                            </GlassButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
