"use client";

/**
 * Menu utilisateur authentifié dans le TopNav.
 * Avatar + popover (rôle, groupes, déconnexion).
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useAuth } from "@/components/auth-provider";
import { GlassButton } from "@/components/ui/glass-button";
import type { MeResponse } from "@/lib/types";

export function UserMenu({ user }: { user: MeResponse }) {
  const { signOut } = useAuth();
  const router = useRouter();
  const tRole = useTranslations("roles");
  const tGroupRole = useTranslations("groupMemberRoles");
  const tMenu = useTranslations("userMenu");
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const initials = user.displayName
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    startTransition(async () => {
      await signOut();
      router.push("/");
    });
  };

  return (
    <div className="relative" data-user-menu>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)] text-[0.85rem] font-semibold text-text backdrop-blur-md transition-colors hover:bg-[color:var(--glass-bg)]"
      >
        {initials || "?"}
      </button>

      {open && (
        <div
          role="menu"
          className="glass-strong absolute right-0 top-12 z-50 w-72 overflow-hidden p-1"
        >
          <div className="border-b border-[color:var(--glass-border)] px-4 py-3">
            <div className="text-[0.92rem] font-semibold text-text">
              {user.displayName}
            </div>
            <div className="truncate text-[0.78rem] text-muted">
              {user.email}
            </div>
            <div className="mt-2 inline-flex items-center rounded-full border border-[color:var(--glass-border)] bg-[color:var(--color-accent-soft)] px-2.5 py-0.5 text-[0.7rem] font-medium text-[color:var(--color-accent)]">
              {tRole(user.role)}
            </div>
          </div>

          {user.groups.length > 0 && (
            <div className="border-b border-[color:var(--glass-border)] px-4 py-3">
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                {tMenu("groups")}
              </div>
              <ul className="mt-1.5 space-y-1">
                {user.groups.map((g) => (
                  <li key={g.id} className="text-[0.85rem] text-text-soft">
                    {g.name}{" "}
                    <span className="text-muted">· {tGroupRole(g.roleInGroup)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-1">
            <GlassButton
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              loading={pending}
              onClick={handleLogout}
            >
              {tMenu("signOut")}
            </GlassButton>
          </div>
        </div>
      )}
    </div>
  );
}
