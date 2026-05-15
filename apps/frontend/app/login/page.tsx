/**
 * /login — Page d'authentification (Visitor).
 * Spec : /hand-off.md §6 Écran 2.
 *
 * 3 modes via tabs :
 *   - signin : email + password
 *   - signup : email + password (+ code optionnel)
 *   - join   : email + password + code obligatoire (XXXX-XXXX-XXXX)
 *
 * Backend non-câblé en v1 (cf. tâche 1.3 / 1.11).
 * OAuth Google/GitHub : reporté en v3 (§8 roadmap).
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { sanitizeNextPath } from "@/lib/safe-redirect";

import { LoginShell } from "./login-shell";

const VALID_MODES = ["signin", "signup", "join"] as const;
type LoginMode = (typeof VALID_MODES)[number];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("login");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

interface LoginPageProps {
  searchParams: Promise<{
    mode?: string;
    code?: string;
    expired?: string;
    next?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initialMode: LoginMode = VALID_MODES.includes(
    params.mode as LoginMode
  )
    ? (params.mode as LoginMode)
    : "signin";

  return (
    <LoginShell
      initialMode={initialMode}
      initialCode={params.code}
      sessionExpired={params.expired === "1"}
      nextPath={sanitizeNextPath(params.next)}
    />
  );
}
