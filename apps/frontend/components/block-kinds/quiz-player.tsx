"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { GlassCard } from "@/components/ui/glass-card";
import { CheckCircleIcon, AlertCircleIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface QuizPlayerProps {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number | null;
  explanation?: string;
}

/**
 * Interactive quiz block for the reader. Reveals correctness against
 * `correctIndex` on selection. XP awarding is v3 (hand-off §11.1).
 */
export function QuizPlayer({
  id,
  question,
  options,
  correctIndex,
  explanation,
}: QuizPlayerProps) {
  const t = useTranslations("courseBuilder");
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const isCorrect = answered && picked === correctIndex;

  return (
    <GlassCard id={id} variant="default" className="my-6 p-5">
      <div className="font-display text-[1.15rem] text-text">{question}</div>
      <ul className="mt-4 space-y-2">
        {options.map((opt, i) => {
          const showCorrect = answered && i === correctIndex;
          const showWrong = answered && i === picked && i !== correctIndex;
          return (
            <li key={i}>
              <button
                type="button"
                disabled={answered}
                onClick={() => setPicked(i)}
                aria-pressed={picked === i}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-[var(--r)] border px-4 py-2.5 text-left text-[0.92rem] transition-colors",
                  "border-[color:var(--glass-border)] text-text-soft",
                  !answered &&
                    "hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-soft)]",
                  showCorrect &&
                    "border-[color:var(--color-success)] bg-[color:color-mix(in_oklab,var(--color-success)_15%,transparent)] text-text",
                  showWrong &&
                    "border-[color:var(--color-danger)] bg-[color:color-mix(in_oklab,var(--color-danger)_15%,transparent)] text-text"
                )}
              >
                <span>{opt}</span>
                {showCorrect && (
                  <CheckCircleIcon size={18} className="text-[color:var(--color-success)]" />
                )}
                {showWrong && (
                  <AlertCircleIcon size={18} className="text-[color:var(--color-danger)]" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {answered && (
        <div
          className="mt-4 text-[0.9rem] font-medium"
          style={{ color: isCorrect ? "var(--color-success)" : "var(--color-danger)" }}
          role="status"
        >
          {isCorrect ? t("quiz.correct") : t("quiz.wrong")}
        </div>
      )}
      {answered && explanation && (
        <p className="mt-2 text-[0.88rem] leading-relaxed text-text-soft">{explanation}</p>
      )}
    </GlassCard>
  );
}
