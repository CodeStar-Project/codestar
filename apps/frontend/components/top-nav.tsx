/**
 * TopNav — adaptative selon l'état d'authentification.
 * - Visiteur : toggle thème + CTA "Rejoindre avec un code" + "Se connecter"
 * - Authentifié : liens contextuels par rôle + toggle thème + UserMenu
 */

import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { getMe } from "@/app/actions/auth";
import { getInstanceBranding } from "@/app/actions/instance";
import { BrandMark, type LogoPreset } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassNav, GlassNavInner } from "@/components/ui/glass-nav";
import { KeyIcon } from "@/components/ui/icons";
import { isAdmin, isStaff } from "@/lib/roles";
import type { Role } from "@/lib/types";

/** Role-appropriate "home" route (matches the /dashboard dispatcher). */
function homeHref(role: Role): string {
  if (isAdmin(role)) return "/admin";
  if (isStaff(role)) return "/studio";
  return "/learn";
}

export async function TopNav() {
  const [t, branding, me] = await Promise.all([
    getTranslations("nav"),
    getInstanceBranding(),
    getMe(),
  ]);

  const preset = branding.logo.value as LogoPreset;
  const navLinkClass =
    "rounded-full px-3 py-1.5 text-[0.88rem] text-text-soft hover:bg-[color:var(--glass-bg)] hover:text-text";

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
            <Link href={homeHref(me.role)} className={navLinkClass}>
              {t("home")}
            </Link>
            <Link href="/courses" className={navLinkClass}>
              {t("catalog")}
            </Link>
            {!isStaff(me.role) && (
              <Link href="/my-courses" className={navLinkClass}>
                {t("myCourses")}
              </Link>
            )}
            {isStaff(me.role) && (
              <Link href="/admin/courses" className={navLinkClass}>
                {t("manageCourses")}
              </Link>
            )}
            {isAdmin(me.role) && (
              <Link href="/admin/users" className={navLinkClass}>
                {t("users")}
              </Link>
            )}
          </nav>
        )}

        <span className="flex-1" />

        <ThemeToggle />

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
