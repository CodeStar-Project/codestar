import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface PaletteEntry {
  icon: IconName;
  label: string;
}

const PALETTE: PaletteEntry[] = [
  { icon: "heading", label: "Titre" },
  { icon: "paragraph", label: "Paragraphe" },
  { icon: "quote", label: "Citation" },
  { icon: "code", label: "Code" },
  { icon: "image", label: "Image" },
  { icon: "list-check", label: "Quiz" },
];

function BlockHandle({ icon }: { icon: IconName }) {
  return (
    <span className="flex flex-col items-center gap-1 pt-1.5 select-none shrink-0">
      <span className="h-7 w-7 rounded-md border border-line bg-canvas/60 flex items-center justify-center text-ink-3">
        <Icon name={icon} className="text-[0.65rem]" />
      </span>
    </span>
  );
}

function PaletteRow({ entry }: { entry: PaletteEntry }) {
  return (
    <li className="flex items-center justify-between p-3 bg-canvas rounded-xl border border-line group hover:border-line-strong transition-colors cursor-grab">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-card border border-line flex items-center justify-center text-ink-2 group-hover:text-brand transition-colors">
          <Icon name={entry.icon} className="text-[0.85rem]" />
        </div>
        <span className="font-medium text-[0.95rem]">{entry.label}</span>
      </div>
      <Icon name="grip" className="text-ink-3 text-xs" />
    </li>
  );
}

function QuizBlockContent() {
  return (
    <div className="flex-1 min-w-0 bg-canvas border border-line rounded-xl p-4">
      <div className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brand">
        Quiz · question 1/3
      </div>
      <p className="mt-2 font-medium">
        Lequel de ces mots-clés déclare une fonction en Go ?
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {(["def", "function", "func", "fn"] as const).map((c, i) => (
          <div
            key={c}
            className={cn(
              "px-3 py-2 rounded-lg border text-[0.9rem] flex items-center gap-2",
              i === 2
                ? "border-brand bg-brand-soft text-foreground"
                : "border-line bg-card text-ink-2"
            )}
          >
            <span
              className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center text-primary-foreground",
                i === 2 ? "bg-brand border-brand" : "border-line-strong"
              )}
            >
              {i === 2 && <Icon name="check" className="text-[0.55rem]" />}
            </span>
            <span className={i === 2 ? "font-semibold" : ""}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlockEditorPreview() {
  return (
    <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      <Card
        asChild
        className="lg:col-span-4 p-6 shadow-[0_2px_30px_-12px_rgba(0,0,0,0.08)]"
      >
        <aside>
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-ink-3">
            Palette de blocs
          </div>
          <p className="mt-2 font-display text-2xl tracking-tight">
            Six types, un cours.
          </p>
          <p className="mt-2 text-ink-2 text-[0.92rem] leading-relaxed">
            Glissez, déposez, écrivez. L’éditeur compose votre cours sans
            imposer de format.
          </p>
          <ul className="mt-6 space-y-2">
            {PALETTE.map((entry) => (
              <PaletteRow key={entry.label} entry={entry} />
            ))}
          </ul>
        </aside>
      </Card>

      <Card className="lg:col-span-8 overflow-hidden p-0 shadow-[0_2px_30px_-12px_rgba(0,0,0,0.08)]">
        <div className="px-5 py-3 border-b border-line flex items-center gap-3 bg-canvas/60">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-line-strong" />
            <span className="h-3 w-3 rounded-full bg-line-strong" />
            <span className="h-3 w-3 rounded-full bg-line-strong" />
          </div>
          <div className="flex-1 mx-2 sm:mx-4 text-center">
            <span className="inline-block px-3 py-0.5 rounded-md bg-canvas border border-line text-[0.72rem] text-ink-2 font-mono truncate max-w-full">
              codestar.local / cours / les-bases-de-go
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-ink-3 text-[0.72rem]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Sauvegardé
          </div>
        </div>

        <div className="p-6 lg:p-9 space-y-5">
          <div className="flex items-start gap-3">
            <BlockHandle icon="heading" />
            <h3 className="font-display text-2xl lg:text-3xl tracking-tight">
              Les bases de Go
            </h3>
          </div>

          <div className="flex items-start gap-3">
            <BlockHandle icon="paragraph" />
            <p className="text-[0.96rem] leading-[1.7] text-ink-2">
              Go est un langage compilé à typage statique, conçu pour la
              concurrence et la simplicité. Vous écrirez vos premiers
              programmes idiomatiques en quelques heures.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <BlockHandle icon="quote" />
            <blockquote className="border-l-2 border-brand pl-4 italic text-foreground leading-relaxed">
              « Don’t communicate by sharing memory; share memory by
              communicating. »
              <span className="block mt-1 not-italic text-[0.85rem] text-ink-3">
                — Rob Pike
              </span>
            </blockquote>
          </div>

          <div className="flex items-start gap-3">
            <BlockHandle icon="code" />
            <div className="flex-1 min-w-0">
              <div className="rounded-xl bg-code-bg text-code-fg p-4 lg:p-5 font-mono text-[0.84rem] leading-[1.7] overflow-x-auto no-scrollbar">
                <div>
                  <span className="text-[#cba6f7]">package</span> main
                </div>
                <div>
                  <span className="text-[#cba6f7]">import</span>{" "}
                  <span className="text-[#a6e3a1]">&quot;fmt&quot;</span>
                </div>
                <div className="h-2" />
                <div>
                  <span className="text-[#cba6f7]">func</span>{" "}
                  <span className="text-[#89b4fa]">main</span>() {"{"}
                </div>
                <div className="pl-4">
                  <span className="text-[#89b4fa]">fmt</span>.
                  <span className="text-brand">Println</span>(
                  <span className="text-[#a6e3a1]">
                    &quot;Bonjour, CodeStar&quot;
                  </span>
                  )
                </div>
                <div>{"}"}</div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BlockHandle icon="list-check" />
            <QuizBlockContent />
          </div>

          <button
            type="button"
            className="w-full h-12 rounded-xl border border-dashed border-line-strong text-ink-3 hover:text-brand hover:border-brand transition-colors flex items-center justify-center gap-2 text-[0.9rem]"
          >
            <Icon name="plus" /> Ajouter un bloc
          </button>
        </div>
      </Card>
    </div>
  );
}
