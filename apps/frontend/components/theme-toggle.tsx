"use client";

/**
 * Light/dark toggle (glass pill). Shows the icon of the theme it will switch
 * TO. Placed in the top-nav next to the locale switcher.
 */

import * as React from "react";
import { useTranslations } from "next-intl";

import { useTheme } from "@/components/theme-provider";

function SunIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("theme");
  const { resolved, toggle } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("toggleTo", { mode: t(next) })}
      title={t("toggleTo", { mode: t(next) })}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] text-text-soft backdrop-blur-md transition-colors hover:text-text hover:bg-[color:var(--glass-bg-strong)] " +
        (className ?? "")
      }
    >
      {resolved === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
