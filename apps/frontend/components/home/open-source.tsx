import { SectionLabel } from "@/components/brand/section-label";
import { StarMark } from "@/components/brand/star-mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/lib/icons";
import { revealDelay } from "@/lib/reveal";

const CONTRIBUTE: { icon: IconName; label: string }[] = [
  { icon: "code-pr", label: "Ouvrir une issue, proposer une PR" },
  { icon: "comments", label: "Participer aux discussions du projet" },
  { icon: "language", label: "Traduire l’interface dans une langue" },
  { icon: "book-open", label: "Améliorer la documentation" },
];

function ManifestoCard() {
  return (
    <Card
      surface="canvas"
      className="p-7 lg:p-9 relative overflow-hidden"
      data-reveal
      style={revealDelay(180)}
    >
      <div
        className="absolute top-0 right-0 -translate-y-8 translate-x-6 opacity-10"
        aria-hidden
      >
        <StarMark size={140} />
      </div>
      <div className="relative">
        <div className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-brand">
          Manifeste
        </div>
        <p className="mt-4 font-display text-2xl leading-[1.18] tracking-tight">
          « Apprendre est un bien commun. Outils, données, gouvernance —
          tout doit le rester. »
        </p>

        <ul className="mt-8 space-y-3 text-[0.95rem] text-ink-2">
          {CONTRIBUTE.map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <Icon
                name={item.icon}
                className="text-brand w-5 text-center mt-1"
              />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export function OpenSource() {
  return (
    <section
      id="contribuer"
      className="relative py-24 lg:py-32 bg-card border-t border-line scroll-mt-24"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-y-10 lg:gap-x-12 items-start">
          <div className="lg:col-span-7">
            <div data-reveal>
              <SectionLabel index="06" label="Engagement" />
            </div>
            <h2
              className="font-display mt-8 text-[clamp(2.2rem,5.6vw,4.4rem)]"
              data-reveal
              style={revealDelay(60)}
            >
              Un commun.
              <br />
              <span className="text-brand">Pas un produit.</span>
            </h2>
            <p
              className="mt-7 text-ink-2 text-[1.06rem] leading-[1.6] max-w-[58ch]"
              data-reveal
              style={revealDelay(120)}
            >
              CodeStar n’a pas de modèle économique caché. Pas de version
              premium, pas de fonctionnalité retenue. Le projet appartient à
              celles et ceux qui l’utilisent et le font vivre.
            </p>

            <div
              className="mt-10 flex flex-col sm:flex-row gap-3"
              data-reveal
              style={revealDelay(200)}
            >
              <Button asChild variant="solid" size="md">
                <a
                  href="https://github.com/CodeStar-Project"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="github" className="text-[1.1rem]" />
                  github.com/CodeStar-Project
                  <Icon
                    name="arrow-out"
                    className="text-[0.72rem] opacity-60"
                  />
                </a>
              </Button>
              <Button asChild variant="outline" size="md">
                <a
                  href="https://www.gnu.org/licenses/gpl-3.0.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="scale" />
                  Licence GPL v3
                </a>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <ManifestoCard />
          </div>
        </div>
      </div>
    </section>
  );
}
