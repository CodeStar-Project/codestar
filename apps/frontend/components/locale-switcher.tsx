"use client";

/**
 * Mini sélecteur de langue, posé dans le footer.
 * Persiste via cookie `NEXT_LOCALE` (server action `setLocaleAction`).
 */

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";

import { setLocaleAction } from "@/app/actions/locale";
import { LOCALES, type Locale } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const current = useLocale() as Locale;
  const [pending, startTransition] = React.useTransition();

  const onChange = (next: Locale) => {
    if (next === current) return;
    startTransition(() => {
      setLocaleAction(next);
    });
  };

  return (
    <div
      role="radiogroup"
      aria-label={t("label")}
      className="inline-flex rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] p-0.5 text-[0.72rem] backdrop-blur-md"
    >
      {LOCALES.map((loc) => {
        const active = loc === current;
        return (
          <button
            key={loc}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={pending}
            onClick={() => onChange(loc)}
            className={
              "rounded-full px-2.5 py-1 font-medium uppercase transition-colors " +
              (active
                ? "bg-[color:var(--glass-bg-strong)] text-text"
                : "text-muted hover:text-text-soft")
            }
          >
            {loc}
          </button>
        );
      })}
    </div>
  );
}
