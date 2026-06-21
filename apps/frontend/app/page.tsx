import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getMe } from "@/app/actions/auth";
import { getInstanceBranding } from "@/app/actions/instance";
import { BrandMark } from "@/components/brand-mark";
import { AuroraLayer } from "@/components/home/aurora-layer";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { TopNav } from "@/components/top-nav";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassChip } from "@/components/ui/glass-chip";
import { Magnetic } from "@/components/ui/magnetic";
import { ArrowRightIcon, SparklesIcon, StarIcon } from "@/components/ui/icons";

const CODESTAR_REPO = "https://github.com/CodeStar-Project";

/**
 * Landing publique — une seule vue, volontairement non défilable (`h-[100dvh]`
 * + `overflow-hidden`). Parti pris : sobre mais impactant. Aucune donnée
 * inventée (pas de note moyenne, pas de nombre d'apprenants). On ne montre que
 * la phrase de l'instance (tagline) et des faits réels et vérifiables.
 */
export default async function HomePage() {
  const me = await getMe();
  // Un utilisateur authentifié ne voit jamais la landing — on l'aiguille.
  if (me) redirect("/dashboard");

  const [tInstance, tLanding, tNav, tFooter, branding] = await Promise.all([
    getTranslations("instance"),
    getTranslations("home.landing"),
    getTranslations("nav"),
    getTranslations("footer"),
    getInstanceBranding(),
  ]);

  const heroTitle = branding.heroTitle ?? tInstance("heroTitle");
  const heroSubtitle = branding.heroSubtitle ?? tInstance("heroSubtitle");
  const heroCta = branding.heroCta ?? tInstance("heroCta");
  const tagline = branding.tagline ?? tInstance("tagline");

  const facts = [
    tLanding("facts.openSource"),
    tLanding("facts.license"),
    tLanding("facts.selfHosted"),
  ];

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      {/* Décor animé plein écran (aurora + orbes + particules), derrière tout. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
      >
        <AuroraLayer />
      </div>

      <TopNav />

      <main
        id="main"
        className="relative flex flex-1 flex-col items-center justify-center px-6 py-6 text-center"
      >
        {/* Eyebrow : LA phrase — tagline de l'instance (settings). */}
        <GlassChip
          variant="accent"
          size="lg"
          className="fx-rise mb-7"
          style={{ animationDelay: "0.05s" }}
        >
          <StarIcon size={14} />
          {tagline}
        </GlassChip>

        <h1
          className="fx-rise mx-auto max-w-4xl font-display text-[clamp(2.5rem,6.4vw,4.75rem)] leading-[1.02] tracking-tight text-text"
          style={{ animationDelay: "0.15s" }}
        >
          {heroTitle}
        </h1>

        <p
          className="fx-rise mx-auto mt-6 max-w-xl text-[1.05rem] leading-relaxed text-text-soft md:text-[1.2rem]"
          style={{ animationDelay: "0.3s" }}
        >
          {heroSubtitle}
        </p>

        <div
          className="fx-rise mt-10 flex flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: "0.45s" }}
        >
          <Magnetic>
            <GlassButton
              asChild
              variant="primary"
              size="lg"
              className="fx-cta-glow fx-sheen"
            >
              <Link href="/login?mode=signup">
                <SparklesIcon size={16} />
                {heroCta}
                <ArrowRightIcon size={14} />
              </Link>
            </GlassButton>
          </Magnetic>
          <Magnetic strength={10}>
            <GlassButton asChild variant="glass" size="lg" className="fx-sheen">
              <Link href="/login">{tNav("signin")}</Link>
            </GlassButton>
          </Magnetic>
        </div>

        {/* Faits réels uniquement — vérifiables dans le dépôt / la licence. */}
        <ul className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {facts.map((fact, i) => (
            <li
              key={fact}
              className="fx-rise"
              style={{ animationDelay: `${0.6 + i * 0.1}s` }}
            >
              <GlassChip variant="default" size="md" className="fx-sheen">
                {fact}
              </GlassChip>
            </li>
          ))}
        </ul>
      </main>

      {/*
        Footer slim — reste dans le viewport (pas de scroll).
        La mention « Built on Codestar » est figée par la licence GPLv3 :
        ne pas la masquer ni la retirer.
      */}
      <footer className="shrink-0 border-t border-[color:var(--glass-border)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 md:px-8">
          <LocaleSwitcher />
          <a
            href={CODESTAR_REPO}
            target="_blank"
            rel="noopener noreferrer"
            title={tFooter("builtOnTitle")}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)] px-3 py-1.5 font-mono text-[0.72rem] text-text-soft backdrop-blur-md transition-colors hover:text-text"
          >
            <BrandMark size={14} />
            <span>
              {tFooter("builtOn")}{" "}
              <span className="font-semibold text-text">Codestar</span>
            </span>
          </a>
        </div>
      </footer>
    </div>
  );
}
