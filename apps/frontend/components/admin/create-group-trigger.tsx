"use client";

import { useState } from "react";

import { CreateGroupModal, type CreateGroupModalLabels } from "@/components/admin/create-group-modal";
import { GlassButton } from "@/components/ui/glass-button";

interface CreateGroupTriggerProps {
  newGroup: string;
  form: CreateGroupModalLabels;
}

export function CreateGroupTrigger({ newGroup, form }: CreateGroupTriggerProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <GlassButton variant="primary" onClick={() => setOpen(true)}>
        {newGroup}
      </GlassButton>
      <CreateGroupModal open={open} onClose={() => setOpen(false)} labels={form} />
    </>
  );
}
