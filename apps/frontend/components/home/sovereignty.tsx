import { SectionLabel } from "@/components/brand/section-label";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/lib/icons";
import { revealDelay } from "@/lib/reveal";

interface Pillar {
  icon: IconName;
  title: string;
  desc: string;
}

const PILLARS: Pillar[] = [
  {
    icon: "server",
    title: "Self-hosted",
    desc: "Sur vos serveurs, derrière votre pare-feu. Aucun appel sortant, aucune télémétrie.",
  },
  {
    icon: "code-branch",
    title: "Open source",
    desc: "Code ouvert, auditable, modifiable. Le projet vit de ses contributeurs.",
  },
  {
    icon: "scale",
    title: "GPL v3",
    desc: "Vous pouvez utiliser, modifier, redistribuer. À une condition : que ça reste libre.",
  },
];

function PillarCard({
  pillar,
  index,
}: {
  pillar: Pillar;
  index: number;
}) {
  return (
    <div
      className="bg-card p-8 lg:p-10 group relative"
      data-reveal
      style={revealDelay(160 + index * 90)}
    >
      <div className="flex items-center justify-between">
        <div className="h-12 w-12 rounded-2xl bg-canvas border border-line flex items-center justify-center text-foreground group-hover:bg-brand group-hover:text-primary-foreground group-hover:border-brand transition-all duration-300">
          <Icon name={pillar.icon} className="text-lg" />
        </div>
        <span className="font-mono text-[0.75rem] text-ink-3">
          0{index + 1}
        </span>
      </div>
      <h3 className="mt-7 font-display text-[1.7rem] tracking-tight">
        {pillar.title}
      </h3>
      <p className="mt-2.5 text-ink-2 text-[0.96rem] leading-relaxed">
        {pillar.desc}
      </p>
    </div>
  );
}

export function Sovereignty() {
  return (
    <section
      id="souverainete"
      className="relative py-24 lg:py-32 scroll-mt-24"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div data-reveal>
          <SectionLabel index="01" label="Souveraineté" />
        </div>

        <h2
          className="font-display mt-8 text-[clamp(2.2rem,5.6vw,4.4rem)] max-w-[19ch]"
          data-reveal
          style={revealDelay(60)}
        >
          Vos données ne quittent <span className="text-brand">jamais</span>{" "}
          votre serveur.
        </h2>

        <p
          className="mt-6 text-[1.05rem] leading-relaxed text-ink-2 max-w-[60ch]"
          data-reveal
          style={revealDelay(120)}
        >
          Pas de cloud externe. Pas de SaaS. Pas de RGPD à négocier avec un
          tiers. Vous installez CodeStar, vous gardez le contrôle. Point.
        </p>

        <div className="mt-14 lg:mt-20 grid md:grid-cols-3 gap-px bg-line-strong rounded-[28px] overflow-hidden border border-line-strong">
          {PILLARS.map((p, i) => (
            <PillarCard key={p.title} pillar={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
