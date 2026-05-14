import { SectionLabel } from "@/components/brand/section-label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { revealDelay } from "@/lib/reveal";
import { cn } from "@/lib/utils";

const CODE_PREVIEW = ["C", "S", "7", "4", "", ""] as const;
const ACTIVE_INDEX = 4;

function CodeCells() {
  return (
    <div className="mt-7 flex items-center gap-2" aria-hidden>
      {CODE_PREVIEW.map((char, i) => {
        const isActive = i === ACTIVE_INDEX;
        const filled = char.length > 0;
        return (
          <div
            key={i}
            className={cn(
              "h-14 w-12 rounded-xl border flex items-center justify-center font-display text-2xl tracking-tight",
              isActive
                ? "border-brand bg-brand-soft text-foreground shadow-[0_0_0_4px_rgba(242,128,34,0.12)]"
                : filled
                  ? "border-line-strong bg-card text-foreground"
                  : "border-line bg-card text-ink-3"
            )}
          >
            {char ||
              (isActive ? (
                <span className="cursor-blink bg-brand w-[2px]" />
              ) : (
                "·"
              ))}
          </div>
        );
      })}
    </div>
  );
}

function StudentCard() {
  return (
    <Card
      asChild
      surface="canvas"
      interactive
      className="group p-7 lg:p-10"
      data-reveal
      style={revealDelay(180)}
    >
      <article>
        <div className="flex items-center justify-between">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-ink-3">
            Vous êtes élève ?
          </div>
          <Icon
            name="user-graduate"
            className="text-ink-3 group-hover:text-brand transition-colors"
          />
        </div>
        <h3 className="mt-3 font-display text-3xl tracking-tight">
          Entrez le code donné par votre formateur.
        </h3>
        <p className="mt-3 text-ink-2 text-[0.95rem] leading-relaxed">
          Six caractères. Aucun compte préalable. Vous arrivez directement
          dans votre groupe.
        </p>

        <CodeCells />

        <Button variant="solid" size="md" className="mt-7">
          Rejoindre le groupe
          <Icon name="arrow-right" className="text-[0.78rem]" />
        </Button>
      </article>
    </Card>
  );
}

function AdminCard() {
  return (
    <Card
      asChild
      surface="canvas"
      interactive
      className="group p-7 lg:p-10 overflow-hidden relative"
      data-reveal
      style={revealDelay(260)}
    >
      <article>
        <div
          className="absolute top-0 right-0 h-48 w-48 rounded-full bg-brand/10 blur-3xl -translate-y-12 translate-x-12 pointer-events-none"
          aria-hidden
        />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-ink-3">
              Vous êtes formateur · admin ?
            </div>
            <Icon
              name="key"
              className="text-ink-3 group-hover:text-brand transition-colors"
            />
          </div>
          <h3 className="mt-3 font-display text-3xl tracking-tight">
            Connectez-vous, ou déployez l’instance de votre organisation.
          </h3>
          <p className="mt-3 text-ink-2 text-[0.95rem] leading-relaxed">
            Si CodeStar n’est pas encore installé chez vous, suivez le guide
            de déploiement.
          </p>

          <div className="mt-7 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="solid" size="md" className="flex-1">
                <Icon name="arrow-into" className="text-[0.85rem]" />
                Me connecter
              </Button>
              <Button asChild variant="outline" size="md" className="flex-1">
                <a href="#deploiement">
                  <Icon name="docker" className="text-[1rem]" />
                  Déployer l’instance
                </a>
              </Button>
            </div>
            <p className="text-[0.78rem] text-ink-3 leading-relaxed pt-1">
              Pas de compte central. Chaque instance gère ses propres
              comptes et son propre annuaire.
            </p>
          </div>
        </div>
      </article>
    </Card>
  );
}

export function JoinOrCreate() {
  return (
    <section className="relative py-24 lg:py-32 bg-card border-y border-line">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div data-reveal>
          <SectionLabel index="04" label="Accès" />
        </div>
        <h2
          className="font-display mt-8 text-[clamp(2rem,5vw,3.8rem)] max-w-[18ch]"
          data-reveal
          style={revealDelay(60)}
        >
          Rejoignez. Ou <span className="text-brand">créez</span>.
        </h2>
        <p
          className="mt-6 text-ink-2 text-[1.02rem] leading-relaxed max-w-[60ch]"
          data-reveal
          style={revealDelay(120)}
        >
          Deux portes d’entrée selon votre rôle. Si votre instance n’existe
          pas encore, c’est peut-être à vous de la créer.
        </p>

        <div className="mt-12 grid lg:grid-cols-2 gap-5">
          <StudentCard />
          <AdminCard />
        </div>
      </div>
    </section>
  );
}
