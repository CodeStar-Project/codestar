import { Wordmark } from "@/components/brand/wordmark";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/lib/icons";

interface FooterLink {
  href: string;
  label: string;
  icon?: IconName;
  external?: boolean;
}

const PROJECT_LINKS: FooterLink[] = [
  {
    href: "https://github.com/CodeStar-Project",
    label: "GitHub",
    icon: "github",
    external: true,
  },
  { href: "#", label: "Documentation", icon: "book" },
  {
    href: "https://www.gnu.org/licenses/gpl-3.0.html",
    label: "Licence GPL v3",
    icon: "scale",
    external: true,
  },
];

const PLATFORM_LINKS: FooterLink[] = [
  { href: "#souverainete", label: "Souveraineté" },
  { href: "#features", label: "Fonctionnalités" },
  { href: "#deploiement", label: "Déploiement" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <div className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-ink-3">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5 text-[0.95rem]">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              {...(l.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="text-ink-2 hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              {l.icon && (
                <Icon name={l.icon} className="text-[0.85rem]" />
              )}
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative bg-canvas border-t border-line py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <Wordmark className="text-[1.2rem]" />
            <p className="mt-4 text-ink-2 text-[0.95rem] leading-relaxed max-w-md">
              Plateforme e-learning open source à hébergement souverain. Un
              projet citoyen, sous licence GPL v3.
            </p>
          </div>

          <FooterColumn title="Projet" links={PROJECT_LINKS} />
          <FooterColumn title="Plateforme" links={PLATFORM_LINKS} />
        </div>

        <div className="mt-14 pt-8 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[0.85rem] text-ink-3">
          <div className="flex items-center gap-3">
            <Icon name="heart" className="text-brand text-[0.8rem]" />
            <span>
              Projet citoyen, écrit pour celles et ceux qui transmettent.
            </span>
          </div>
          <div className="font-mono">
            © {new Date().getFullYear()} · CodeStar Project · GPL v3
          </div>
        </div>
      </div>
    </footer>
  );
}
