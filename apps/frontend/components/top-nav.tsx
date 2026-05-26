/**
 * TopNav publique — adaptative selon l'état d'authentification.
 * - Visiteur : CTA "Rejoindre avec un code" + "Se connecter"
 * - Authentifié : avatar + UserMenu (rôle, groupes, déconnexion)
 *
 * Liens contextuels supplémentaires affichés selon le rôle (admin, teacher).
 */

import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { getMe } from "@/app/actions/auth";
import { getInstanceBranding } from "@/app/actions/instance";
import { BrandMark, type LogoPreset } from "@/components/brand-mark";
import { UserMenu } from "@/components/user-menu";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassNav, GlassNavInner } from "@/components/ui/glass-nav";
import { KeyIcon } from "@/components/ui/icons";
import { isAdmin, isStaff } from "@/lib/roles";

export async function TopNav() {
  const [t, branding, me] = await Promise.all([
    getTranslations("nav"),
    getInstanceBranding(),
    getMe(),
  ]);

  const preset = branding.logo.value as LogoPreset;

  return (
    <GlassNav>
      <GlassNavInner>
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-full"
          aria-label={t("homeAria", { name: branding.name })}
        >
          <BrandMark size={28} preset={preset} accent={branding.accent} />
          <span className="font-semibold text-text">{branding.name}</span>
        </Link>

        {me && (
          <nav
            aria-label={t("sectionsLabel")}
            className="ml-6 hidden items-center gap-1 md:flex"
          >
            <Link
              href="/home"
              className="rounded-full px-3 py-1.5 text-[0.88rem] text-text-soft hover:bg-[color:var(--glass-bg)] hover:text-text"
            >
              {t("home")}
            </Link>
            <Link
              href="/courses"
              className="rounded-full px-3 py-1.5 text-[0.88rem] text-text-soft hover:bg-[color:var(--glass-bg)] hover:text-text"
            >
              {t("catalog")}
            </Link>
            <Link
              href="/my-courses"
              className="rounded-full px-3 py-1.5 text-[0.88rem] text-text-soft hover:bg-[color:var(--glass-bg)] hover:text-text"
            >
              {t("myCourses")}
            </Link>
            {isStaff(me.role) && (
              <Link
                href="/admin"
                className="rounded-full px-3 py-1.5 text-[0.88rem] text-text-soft hover:bg-[color:var(--glass-bg)] hover:text-text"
              >
                {isAdmin(me.role) ? t("admin") : t("teach")}
              </Link>
            )}
          </nav>
        )}

        <span className="flex-1" />

        {me ? (
          <UserMenu user={me} />
        ) : (
          <div className="flex items-center gap-2">
            <GlassButton
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link href="/login?mode=join">
                <KeyIcon size={14} />
                {t("join")}
              </Link>
            </GlassButton>
            <GlassButton asChild variant="glass" size="sm">
              <Link href="/login">{t("signin")}</Link>
            </GlassButton>
          </div>
        )}
      </GlassNavInner>
    </GlassNav>
  );
}
