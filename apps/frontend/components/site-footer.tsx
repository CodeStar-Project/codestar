/**
 * Footer figé — mention "Built on Codestar" non retirable (licence GPLv3).
 * Spec : hand-off §2 + §6 Écran 1.
 */

import { getTranslations } from "next-intl/server";

import { getInstanceBranding } from "@/app/actions/instance";
import { BrandMark } from "@/components/brand-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";

const CODESTAR_REPO = "https://github.com/CodeStar-Project";

export async function SiteFooter() {
  const [t, branding] = await Promise.all([
    getTranslations("footer"),
    getInstanceBranding(),
  ]);
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 border-t border-[color:var(--glass-border)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <BrandMark size={26} logo={branding.logo} accent={branding.accent} />
          <div className="flex flex-col">
            <span className="font-semibold text-text">{branding.name}</span>
            <span className="text-[0.78rem] text-muted">
              {t("rights", { year })}
            </span>
          </div>
        </div>

        <nav
          aria-label={t("label")}
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.85rem] text-text-soft"
        >
          <a href="#" className="hover:text-text transition-colors">
            {t("legal")}
          </a>
          <a href="#" className="hover:text-text transition-colors">
            {t("privacy")}
          </a>
          <a href="#" className="hover:text-text transition-colors">
            {t("contact")}
          </a>
        </nav>

        <div className="flex flex-wrap items-center gap-4">
          <LocaleSwitcher />

          {/*
            MENTION FIGÉE — imposée par licence GPLv3.
            Ne pas masquer, retirer ou rendre conditionnelle.
          */}
          <a
            href={CODESTAR_REPO}
            target="_blank"
            rel="noopener noreferrer"
            title={t("builtOnTitle")}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)] px-3 py-1.5 font-mono text-[0.72rem] text-text-soft backdrop-blur-md transition-colors hover:text-text"
          >
            <BrandMark size={14} />
            <span>
              {t("builtOn")}{" "}
              <span className="font-semibold text-text">Codestar</span>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
