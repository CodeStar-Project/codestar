"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const CHOICES = [
  "Une boucle infinie qui s’arrête après 10 itérations.",
  "Une boucle qui itère exactement 10 fois en partant de 1.",
  "Une boucle qui itère tant que i est strictement inférieur à 10.",
  "Une boucle qui ne se termine jamais.",
] as const;

const CORRECT_INDEX = 2;

function ChoiceButton({
  index,
  text,
  selected,
  onClick,
}: {
  index: number;
  text: string;
  selected: number | null;
  onClick: () => void;
}) {
  const isSelected = selected === index;
  const isCorrect = index === CORRECT_INDEX;
  const showCorrect = isSelected && isCorrect;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-2xl border flex items-start gap-3 transition-all",
        showCorrect
          ? "border-emerald-500/60 bg-emerald-500/5"
          : isSelected
            ? "border-brand bg-brand-soft"
            : "border-line bg-canvas hover:border-line-strong"
      )}
    >
      <span
        className={cn(
          "shrink-0 mt-0.5 h-6 w-6 rounded-md border flex items-center justify-center text-[0.78rem] font-semibold",
          showCorrect
            ? "border-emerald-500 bg-emerald-500 text-primary-foreground"
            : isSelected
              ? "border-brand bg-brand text-primary-foreground"
              : "border-line-strong text-ink-3 font-mono"
        )}
      >
        {showCorrect ? (
          <Icon name="check" className="text-[0.65rem]" />
        ) : (
          String.fromCharCode(65 + index)
        )}
      </span>
      <span
        className={cn(
          "text-[0.95rem] leading-relaxed",
          isSelected ? "text-foreground" : "text-ink-2"
        )}
      >
        {text}
      </span>
    </button>
  );
}

function ProgressDots() {
  return (
    <div className="mt-3 grid grid-cols-8 gap-1.5">
      {Array.from({ length: 8 }).map((_, i) => {
        const state = i < 3 ? "correct" : i === 3 ? "current" : "pending";
        return (
          <div
            key={i}
            className={cn(
              "h-2 rounded-full",
              state === "correct"
                ? "bg-brand"
                : state === "current"
                  ? "bg-foreground"
                  : "bg-line-strong/60"
            )}
          />
        );
      })}
    </div>
  );
}

export function QuizPreview() {
  const [selected, setSelected] = useState<number | null>(CORRECT_INDEX);

  return (
    <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
      <Card className="lg:col-span-3 p-7 lg:p-10 shadow-[0_2px_30px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-3">
          <span>Quiz · question 4 sur 8</span>
          <span className="font-mono">02:14</span>
        </div>
        <div className="mt-3 h-1 w-full bg-line rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-brand rounded-full" />
        </div>

        <h3 className="mt-7 font-display text-2xl lg:text-[1.7rem] leading-[1.2] tracking-tight">
          Que fait{" "}
          <code className="font-mono text-brand bg-brand-soft px-1.5 py-0.5 rounded">
            for i := 0; i &lt; 10; i++
          </code>{" "}
          en Go ?
        </h3>

        <div className="mt-6 space-y-3">
          {CHOICES.map((c, i) => (
            <ChoiceButton
              key={i}
              index={i}
              text={c}
              selected={selected}
              onClick={() => setSelected(i)}
            />
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between flex-wrap gap-3">
          <span className="text-[0.86rem] text-ink-2">
            Une seule bonne réponse
          </span>
          <Button variant="solid" size="sm">
            Valider <Icon name="arrow-right" className="text-[0.78rem]" />
          </Button>
        </div>
      </Card>

      <div className="lg:col-span-2 space-y-4">
        <Card className="p-6 shadow-[0_2px_30px_-12px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-brand">
            <Icon name="circle-info" /> À savoir
          </div>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">
            Les quiz CodeStar peuvent être{" "}
            <span className="text-foreground font-semibold">
              à choix multiple
            </span>
            ,{" "}
            <span className="text-foreground font-semibold">
              à réponse courte
            </span>
            , ou{" "}
            <span className="text-foreground font-semibold">
              à code à exécuter
            </span>
            . Les correcteurs sont configurables par le formateur.
          </p>
        </Card>

        <Card surface="canvas" className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-[0.78rem] font-semibold text-ink-2">
              Progression
            </span>
            <span className="font-mono text-[0.78rem] text-ink-3">3 / 8</span>
          </div>
          <ProgressDots />
        </Card>
      </div>
    </div>
  );
}
