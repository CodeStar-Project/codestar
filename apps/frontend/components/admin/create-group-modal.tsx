"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createGroup } from "@/app/actions/groups";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassField, GlassInput } from "@/components/ui/glass-input";

export interface CreateGroupModalLabels {
  name: string;
  namePlaceholder: string;
  slug: string;
  slugPlaceholder: string;
  slugHelper: string;
  startsAt: string;
  endsAt: string;
  create: string;
  cancel: string;
}

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  labels: CreateGroupModalLabels;
}

export function CreateGroupModal({ open, onClose, labels }: CreateGroupModalProps) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const slug = (fd.get("slug") as string).trim() || undefined;
    const startsAt = (fd.get("startsAt") as string) || null;
    const endsAt = (fd.get("endsAt") as string) || null;

    setError("");
    start(async () => {
      const res = await createGroup({ name, slug, startsAt, endsAt });
      if (res.ok) {
        router.refresh();
        onClose();
        formRef.current?.reset();
      } else {
        setError(res.error ?? "Une erreur est survenue.");
      }
    });
  }

  function handleClose() {
    setError("");
    formRef.current?.reset();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[color:var(--glass-bg)] p-6 shadow-2xl">
        <h2 className="mb-5 text-lg font-semibold text-text">
          Créer un groupe
        </h2>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <GlassField label={labels.name} htmlFor="name">
            <GlassInput
              id="name"
              name="name"
              placeholder={labels.namePlaceholder}
              required
              autoFocus
            />
          </GlassField>

          <GlassField label={labels.slug} htmlFor="slug" helper={labels.slugHelper}>
            <GlassInput
              id="slug"
              name="slug"
              placeholder={labels.slugPlaceholder}
              pattern="^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$"
            />
          </GlassField>

          <div className="grid grid-cols-2 gap-3">
            <GlassField label={labels.startsAt} htmlFor="startsAt">
              <GlassInput id="startsAt" name="startsAt" type="date" />
            </GlassField>
            <GlassField label={labels.endsAt} htmlFor="endsAt">
              <GlassInput id="endsAt" name="endsAt" type="date" />
            </GlassField>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <GlassButton
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={pending}
            >
              {labels.cancel}
            </GlassButton>
            <GlassButton type="submit" variant="primary" disabled={pending}>
              {pending ? "…" : labels.create}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}
