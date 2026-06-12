import type { Metadata } from "next";

import { AdminBreadcrumb, AdminShell } from "@/components/admin/admin-shell";
import { AiGeneratorForm } from "@/components/admin/ai-generator-form";
import { requireRole } from "@/components/admin/role-guard";
import { PageHeader } from "@/components/course/page-header";
import { SparklesIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "AI Course Generator" };

export default async function AiGeneratorPage() {
  await requireRole("TEACHER");

  return (
    <AdminShell>
      <AdminBreadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "AI Course Generator" },
        ]}
      />
      <PageHeader
        kicker="Fonctionnalité expérimentale"
        title="AI Course Generator"
        description="Décris un sujet et laisse l'IA générer un cours complet. Tu pourras le réviser avant de l'importer."
        actions={<SparklesIcon size={24} className="text-accent opacity-70" />}
        className="mb-10"
      />
      <AiGeneratorForm />
    </AdminShell>
  );
}
