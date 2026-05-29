"use client";

import { useMemo, useState, useTransition } from "react";

import {
  removeGroupMember,
  updateGroupMemberRole,
  type GroupMember,
} from "@/app/actions/groups";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassChip } from "@/components/ui/glass-chip";
import { GlassInput } from "@/components/ui/glass-input";
import { TrashIcon } from "@/components/ui/icons";

interface Labels {
  searchPlaceholder: string;
  promoteToTeacher: string;
  demoteToStudent: string;
  remove: string;
  confirmRemove: string;
  empty: string;
  errorUnknown: string;
  columns: {
    user: string;
    roleInGroup: string;
    joinedAt: string;
    actions: string;
  };
  groupRoles: { STUDENT: string; TEACHER: string };
}

interface MembersTableProps {
  groupId: string;
  initialMembers: GroupMember[];
  currentUserId: string;
  labels: Labels;
  locale: "fr" | "en";
}

export function MembersTable({
  groupId,
  initialMembers,
  currentUserId,
  labels,
  locale,
}: MembersTableProps) {
  const [members, setMembers] = useState(initialMembers);
  const [query, setQuery] = useState("");
  const [pending, start] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.email.toLowerCase().includes(q) ||
        m.displayName.toLowerCase().includes(q)
    );
  }, [members, query]);

  function changeRole(m: GroupMember, newRole: "STUDENT" | "TEACHER") {
    setErrorMsg(null);
    start(async () => {
      const r = await updateGroupMemberRole(groupId, m.userId, newRole);
      if (!r.ok || !r.member) {
        setErrorMsg(r.error ?? labels.errorUnknown);
        return;
      }
      setMembers((prev) =>
        prev.map((x) => (x.userId === m.userId ? r.member! : x))
      );
    });
  }

  function remove(m: GroupMember) {
    if (!confirm(labels.confirmRemove)) return;
    setErrorMsg(null);
    start(async () => {
      const r = await removeGroupMember(groupId, m.userId);
      if (!r.ok) {
        setErrorMsg(r.error ?? labels.errorUnknown);
        return;
      }
      setMembers((prev) => prev.filter((x) => x.userId !== m.userId));
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
                  <th className="px-4 py-3 font-medium">{labels.columns.roleInGroup}</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">
                    {labels.columns.joinedAt}
                  </th>
                  <th className="px-4 py-3 text-right font-medium">{labels.columns.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--glass-border)]">
                {filtered.map((m) => {
                  const isTeacher = m.roleInGroup === "TEACHER";
                  const isSelf = m.userId === currentUserId;
                  return (
                    <tr key={m.userId} className="align-middle">
                      <td className="px-4 py-3">
                        <div className="font-medium text-text">{m.displayName}</div>
                        <div className="text-[0.82rem] text-muted">{m.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <GlassChip
                          variant={isTeacher ? "accent" : "default"}
                          size="sm"
                        >
                          {labels.groupRoles[m.roleInGroup]}
                        </GlassChip>
                      </td>
                      <td className="hidden px-4 py-3 text-muted md:table-cell">
                        {new Date(m.joinedAt).toLocaleDateString(locale)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {!isSelf && (
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              disabled={pending}
                              onClick={() =>
                                changeRole(m, isTeacher ? "STUDENT" : "TEACHER")
                              }
                            >
                              {isTeacher
                                ? labels.demoteToStudent
                                : labels.promoteToTeacher}
                            </GlassButton>
                          )}
                          {!isSelf && (
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              disabled={pending}
                              onClick={() => remove(m)}
                              aria-label={labels.remove}
                              className="text-[color:var(--color-danger)] hover:text-[color:var(--color-danger)]"
                            >
                              <TrashIcon size={14} />
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
