import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <GlassCard variant="strong" className="max-w-lg p-10 text-center">
        <div className="font-mono text-[0.75rem] uppercase tracking-[0.2em] text-muted">
          404
        </div>
        <h1 className="mt-2 font-display text-[clamp(1.8rem,4vw,2.5rem)] leading-tight text-text">
          {t("title")}
        </h1>
        <p className="mt-3 text-[0.95rem] text-text-soft">{t("description")}</p>
        <div className="mt-8 flex justify-center">
          <GlassButton asChild variant="primary">
            <Link href="/">{t("home")}</Link>
          </GlassButton>
        </div>
      </GlassCard>
    </main>
  );
}
