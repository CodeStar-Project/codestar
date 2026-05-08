import { SectionLabel } from "@/components/brand/section-label";
import { StarMark } from "@/components/brand/star-mark";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { revealDelay } from "@/lib/reveal";

const HERO_BADGES = ["GPL v3", "Self-hosted", "Docker-ready"] as const;

export function Hero() {
  return (
    <section className="relative pt-36 lg:pt-48 pb-24 lg:pb-32 overflow-hidden">
      <div
        className="absolute inset-0 bg-grid pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_70%)]"
        aria-hidden
      />

      <div
        className="absolute top-32 right-6 lg:right-20 opacity-[0.18] pointer-events-none float-soft"
        aria-hidden
      >
        <StarMark size={148} />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div data-reveal>
          <SectionLabel index="00" label="Manifeste" />
        </div>

        <h1
          className="font-display mt-8 lg:mt-10 text-[clamp(3rem,9vw,7.5rem)] max-w-[15ch]"
          data-reveal
          style={revealDelay(60)}
        >
          Le savoir,
          <br />
          sur <span className="text-brand">vos</span> serveurs.
        </h1>

        <p
          className="mt-8 text-[1.12rem] lg:text-[1.28rem] leading-[1.45] text-ink-2 max-w-[48ch]"
          data-reveal
          style={revealDelay(160)}
        >
          Plateforme e-learning open source.{" "}
          <span className="text-foreground font-medium">
            Vous l’installez chez vous, vous la possédez.
          </span>{" "}
          Personne ne lit, n’analyse, ni ne monétise vos données.
        </p>

        <div
          className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4"
          data-reveal
          style={revealDelay(260)}
        >
          <Button asChild variant="primary" size="lg">
            <a href="#deploiement">
              <Icon name="rocket" />
              Déployer votre instance
              <Icon
                name="arrow-right"
                className="text-[0.78rem] transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a
              href="https://github.com/CodeStar-Project"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="github" className="text-[1.1rem]" />
              Voir le code sur GitHub
            </a>
          </Button>
        </div>

        <div
          className="mt-14 lg:mt-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
          data-reveal
          style={revealDelay(380)}
        >
          <div className="inline-flex items-center gap-3 max-w-full">
            <div className="h-10 w-10 rounded-xl bg-code-bg flex items-center justify-center text-code-fg shrink-0">
              <Icon name="terminal" className="text-sm" />
            </div>
            <div className="font-mono text-[0.86rem] text-ink-2 truncate">
              <span className="text-ink-3">$</span> docker compose up{" "}
              <span className="text-brand">codestar</span>
              <span className="cursor-blink text-brand" aria-hidden />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-ink-3">
            {HERO_BADGES.map((b) => (
              <span key={b} className="inline-flex items-center gap-2">
                <Icon name="check" className="text-brand" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
