"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const t = useTranslations("errors");

  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <GlassCard variant="strong" className="max-w-lg p-10 text-center">
        <h1 className="font-display text-[clamp(1.8rem,4vw,2.5rem)] leading-tight text-text">
          {t("title")}
        </h1>
        <p className="mt-3 text-[0.95rem] text-text-soft">{t("description")}</p>
        {error.digest ? (
          <p className="mt-2 font-mono text-[0.72rem] text-muted">
            #{error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <GlassButton variant="primary" onClick={unstable_retry}>
            {t("retry")}
          </GlassButton>
          <GlassButton asChild variant="outline">
            <Link href="/">{t("home")}</Link>
          </GlassButton>
        </div>
      </GlassCard>
    </main>
  );
}
