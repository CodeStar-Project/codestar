import { SectionLabel } from "@/components/brand/section-label";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/lib/icons";
import { revealDelay } from "@/lib/reveal";

interface Persona {
  icon: IconName;
  kicker: string;
  title: string;
  details: string;
}

const PERSONAS: Persona[] = [
  {
    icon: "graduation",
    kicker: "Une école",
    title: "Former sans dépendre d’un GAFAM.",
    details:
      "Cours, devoirs, classes, évaluations — sur l’infrastructure de l’établissement.",
  },
  {
    icon: "briefcase",
    kicker: "Une entreprise",
    title: "Onboarder ses équipes sur des sujets internes et confidentiels.",
    details:
      "Contenus sensibles, équipes, parcours métier — tout reste à l’intérieur.",
  },
  {
    icon: "people",
    kicker: "Une association",
    title: "Transmettre des savoirs en autonomie, sans coût de licence.",
    details: "Bénévoles, apprenants, ateliers. Déployable sur un VPS modeste.",
  },
];

function PersonaCard({
  persona,
  index,
}: {
  persona: Persona;
  index: number;
}) {
  return (
    <Card
      asChild
      surface="canvas"
      interactive
      className="group p-6 lg:p-7 flex items-start gap-5"
      data-reveal
      style={revealDelay(180 + index * 90)}
    >
      <article>
        <div className="h-12 w-12 shrink-0 rounded-xl bg-card border border-line flex items-center justify-center text-foreground group-hover:bg-brand group-hover:text-primary-foreground group-hover:border-brand transition-all duration-300">
          <Icon name={persona.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-3 group-hover:text-brand transition-colors">
            {persona.kicker}
          </div>
          <p className="mt-1.5 text-[1.08rem] font-semibold leading-snug">
            {persona.title}
          </p>
          <p className="mt-2 text-[0.93rem] text-ink-2 leading-relaxed">
            {persona.details}
          </p>
        </div>
        <div className="shrink-0 h-9 w-9 rounded-full border border-line flex items-center justify-center text-ink-3 group-hover:border-foreground group-hover:text-foreground transition-all">
          <Icon name="arrow-right" className="text-[0.78rem]" />
        </div>
      </article>
    </Card>
  );
}

export function Personas() {
  return (
    <section className="relative py-24 lg:py-32 bg-card border-y border-line">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-y-12 lg:gap-x-12">
          <div className="lg:col-span-5">
            <div data-reveal>
              <SectionLabel index="02" label="Pour qui" />
            </div>
            <h2
              className="font-display mt-8 text-[clamp(2rem,5vw,3.8rem)]"
              data-reveal
              style={revealDelay(60)}
            >
              Pour toute organisation qui refuse de céder son savoir.
            </h2>
            <p
              className="mt-6 text-ink-2 text-[1.02rem] leading-relaxed"
              data-reveal
              style={revealDelay(120)}
            >
              CodeStar n’est pas un produit générique. C’est un commun, qui
              s’adapte à votre structure et qui vous appartient une fois
              déployé.
            </p>
          </div>

          <div className="lg:col-span-7 grid gap-4">
            {PERSONAS.map((p, i) => (
              <PersonaCard key={p.kicker} persona={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
