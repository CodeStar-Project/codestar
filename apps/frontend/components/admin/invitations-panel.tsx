"use client";

// Invitation codes panel — list plus a create form with optimistic insert.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createInvitation, type Invitation } from "@/app/actions/groups";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { GlassField, GlassInput } from "@/components/ui/glass-input";

interface Labels {
  invitationsTitle: string;
  invitationsDesc: string;
  newInvitation: string;
  invitationFormMaxUses: string;
  invitationFormExpiresAt: string;
  invitationFormCreate: string;
  code: string;
  uses: string;
  expires: string;
  noExpiry: string;
  noInvitations: string;
  copyCode: string;
  createError: string;
}

interface InvitationsPanelProps {
  groupId: string;
  initialInvitations: Invitation[];
  labels: Labels;
}

export function InvitationsPanel({
  groupId,
  initialInvitations,
  labels,
}: InvitationsPanelProps) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  // Local copy for optimistic updates
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => {
      // Fallback for non-secure contexts
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const maxUses = parseInt(fd.get("maxUses") as string, 10) || 1;
    const rawExpiry = fd.get("expiresAt") as string;
    const expiresAt = rawExpiry ? new Date(rawExpiry).toISOString() : undefined;

    setError("");
    start(async () => {
      const res = await createInvitation(groupId, maxUses, expiresAt);
      if (res.ok && res.invitation) {
        setInvitations((prev) => [res.invitation!, ...prev]);
        setShowForm(false);
        form.reset();
        router.refresh();
      } else {
        setError(res.error ?? labels.createError);
      }
    });
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-text">{labels.invitationsTitle}</h2>
          <p className="text-sm text-text-soft">{labels.invitationsDesc}</p>
        </div>
        <GlassButton
          variant="outline"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          className="shrink-0"
        >
          {labels.newInvitation}
        </GlassButton>
      </div>

      {showForm && (
        <GlassCard variant="plain" className="mb-4">
          <GlassCardContent className="p-4">
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
              <GlassField
                label={labels.invitationFormMaxUses}
                htmlFor="maxUses"
                className="w-32"
              >
                <GlassInput
                  id="maxUses"
                  name="maxUses"
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={1000}
                />
              </GlassField>
              <GlassField
                label={labels.invitationFormExpiresAt}
                htmlFor="expiresAt"
                className="w-56"
              >
                <GlassInput
                  id="expiresAt"
                  name="expiresAt"
                  type="datetime-local"
                />
              </GlassField>
              <GlassButton
                type="submit"
                variant="primary"
                size="sm"
                disabled={pending}
              >
                {pending ? "…" : labels.invitationFormCreate}
              </GlassButton>
            </form>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </GlassCardContent>
        </GlassCard>
      )}

      {invitations.length === 0 ? (
        <p className="text-sm text-text-soft">{labels.noInvitations}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {invitations.map((inv) => (
            <GlassCard key={inv.id} variant="plain">
              <GlassCardContent className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-sm font-medium text-text">
                    {inv.code}
                  </span>
                  <span className="text-xs text-text-soft">
                    {labels.uses
                      .replace("{used}", String(inv.usedCount))
                      .replace("{max}", String(inv.maxUses))}
                    {" · "}
                    {inv.expiresAt
                      ? labels.expires.replace(
                          "{date}",
                          new Date(inv.expiresAt).toLocaleDateString()
                        )
                      : labels.noExpiry}
                  </span>
                </div>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(inv.code)}
                >
                  {copied === inv.code ? "✓" : labels.copyCode}
                </GlassButton>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      )}
    </section>
  );
}
