"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  generateAiCourse,
  importAiCourse,
  type AiCourseDraft,
  type GenerateRequest,
} from "@/app/actions/ai";
import { GlassButton } from "@/components/ui/glass-button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import {
  ArrowRightIcon,
  BookIcon,
  CheckCircleIcon,
  PlusIcon,
  SparklesIcon,
  XIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type Language = "fr" | "en";

const LEVELS: { value: Level; label: string; description: string }[] = [
  { value: "BEGINNER", label: "Débutant", description: "Langage simple, analogies, exemples pas à pas" },
  { value: "INTERMEDIATE", label: "Intermédiaire", description: "Patterns, bonnes pratiques, compromis" },
  { value: "ADVANCED", label: "Avancé", description: "Cas limites, performance, décisions d'architecture" },
];

const GENERATION_STEPS = [
  "Analyse du sujet et des objectifs…",
  "Construction du plan pédagogique…",
  "Rédaction des concepts et définitions…",
  "Enrichissement avec exemples et cas pratiques…",
  "Ajout des tableaux et synthèses…",
  "Finalisation et vérification du cours…",
];

const BLOCK_COLORS: Record<string, string> = {
  H1: "bg-violet-500/15 text-violet-300",
  H2: "bg-violet-400/15 text-violet-300",
  H3: "bg-violet-300/15 text-violet-300",
  H4: "bg-violet-300/10 text-violet-400",
  H5: "bg-violet-300/10 text-violet-400",
  H6: "bg-violet-300/10 text-violet-400",
  P: "bg-slate-500/15 text-slate-300",
  CODE: "bg-emerald-500/15 text-emerald-300",
  CALLOUT: "bg-amber-500/15 text-amber-300",
  QUOTE: "bg-sky-500/15 text-sky-300",
  TABLE: "bg-blue-500/15 text-blue-300",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KeyIdeasInput({
  ideas,
  onChange,
}: {
  ideas: string[];
  onChange: (ideas: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit() {
    const trimmed = input.trim();
    if (!trimmed || ideas.length >= 10 || ideas.includes(trimmed)) return;
    if (trimmed.length > 100) return;
    onChange([...ideas, trimmed]);
    setInput("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && input === "" && ideas.length > 0) {
      onChange(ideas.slice(0, -1));
    }
  }

  return (
    <div
      className="flex min-h-[42px] cursor-text flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-colors focus-within:border-accent/50 focus-within:bg-white/8"
      onClick={() => inputRef.current?.focus()}
    >
      {ideas.map((idea) => (
        <span
          key={idea}
          className="flex items-center gap-1.5 rounded-md bg-accent/20 px-2 py-0.5 text-sm text-accent"
        >
          {idea}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(ideas.filter((i) => i !== idea));
            }}
            className="opacity-60 transition-opacity hover:opacity-100"
            aria-label={`Supprimer "${idea}"`}
          >
            <XIcon size={12} />
          </button>
        </span>
      ))}
      {ideas.length < 10 && (
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={ideas.length === 0 ? "Appuie sur Entrée pour ajouter…" : ""}
          className="min-w-[140px] flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-soft"
          maxLength={100}
        />
      )}
    </div>
  );
}

function GeneratingAnimation({ onDone }: { onDone?: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex >= GENERATION_STEPS.length - 1) return;
    const id = setTimeout(() => setStepIndex((s) => s + 1), 12000);
    return () => clearTimeout(id);
  }, [stepIndex]);

  return (
    <GlassCard variant="strong" className="overflow-hidden">
      <GlassCardContent className="p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <SparklesIcon size={28} className="animate-pulse text-accent" />
            <span className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
          </div>
          <div>
            <p className="font-display text-lg text-text">Génération en cours</p>
            <p className="mt-1 text-sm text-text-soft">La génération d'un cours détaillé peut prendre jusqu'à 90 secondes</p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            {GENERATION_STEPS.map((step, i) => (
              <div
                key={step}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all duration-500",
                  i < stepIndex && "text-text-soft line-through opacity-40",
                  i === stepIndex && "bg-accent/10 font-medium text-accent",
                  i > stepIndex && "opacity-30 text-text-soft"
                )}
              >
                {i < stepIndex ? (
                  <CheckCircleIcon size={16} className="shrink-0 text-emerald-400" />
                ) : i === stepIndex ? (
                  <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
                ) : (
                  <span className="h-4 w-4 shrink-0 rounded-full border border-white/10" />
                )}
                {step}
              </div>
            ))}
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    BEGINNER: "bg-emerald-500/15 text-emerald-300",
    INTERMEDIATE: "bg-amber-500/15 text-amber-300",
    ADVANCED: "bg-red-500/15 text-red-300",
  };
  const labels: Record<string, string> = {
    BEGINNER: "Débutant",
    INTERMEDIATE: "Intermédiaire",
    ADVANCED: "Avancé",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", colors[level] ?? "bg-slate-500/15 text-slate-300")}>
      {labels[level] ?? level}
    </span>
  );
}

function DraftPreview({
  draft,
  onImport,
  onRegenerate,
  importing,
}: {
  draft: AiCourseDraft;
  onImport: () => void;
  onRegenerate: () => void;
  importing: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Course header */}
      <GlassCard variant="strong">
        <GlassCardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <LevelBadge level={draft.course.level} />
                {draft.course.category && (
                  <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-text-soft">
                    {draft.course.category}
                  </span>
                )}
              </div>
              <h2 className="font-display text-2xl text-text">{draft.course.title}</h2>
              {draft.course.description && (
                <p className="mt-2 text-sm leading-relaxed text-text-soft">{draft.course.description}</p>
              )}
              <p className="mt-3 text-xs text-muted">
                {draft.pages.length} page{draft.pages.length !== 1 ? "s" : ""} ·{" "}
                {draft.pages.reduce((n, p) => n + p.blocks.length, 0)} blocs
              </p>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Pages grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {draft.pages.map((page, i) => {
          const kinds = [...new Set(page.blocks.map((b) => b.kind))];
          return (
            <GlassCard key={i} variant="default">
              <GlassCardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                    {i + 1}
                  </span>
                  <span className="truncate font-medium text-text">{page.title}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {kinds.map((kind) => (
                    <span
                      key={kind}
                      className={cn(
                        "rounded px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide",
                        BLOCK_COLORS[kind] ?? "bg-slate-500/15 text-slate-300"
                      )}
                    >
                      {kind}
                    </span>
                  ))}
                  {page.blocks.length > 1 && (
                    <span className="text-[11px] text-muted">
                      ({page.blocks.length} blocs)
                    </span>
                  )}
                </div>
              </GlassCardContent>
            </GlassCard>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <GlassButton variant="primary" size="lg" onClick={onImport} loading={importing} disabled={importing}>
          <BookIcon size={16} />
          Importer et éditer
          <ArrowRightIcon size={16} />
        </GlassButton>
        <GlassButton variant="ghost" size="lg" onClick={onRegenerate} disabled={importing}>
          <SparklesIcon size={16} />
          Regénérer
        </GlassButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export function AiGeneratorForm() {
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<Level>("INTERMEDIATE");
  const [language, setLanguage] = useState<Language>("fr");
  const [keyIdeas, setKeyIdeas] = useState<string[]>([]);

  const [generating, startGenerate] = useTransition();
  const [importing, startImport] = useTransition();
  const [draft, setDraft] = useState<AiCourseDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = topic.trim().length >= 5 && !generating && !importing;

  function handleGenerate() {
    setError(null);
    setDraft(null);
    const request: GenerateRequest = {
      topic: topic.trim(),
      level,
      language,
      keyIdeas: keyIdeas.length > 0 ? keyIdeas : undefined,
    };
    startGenerate(async () => {
      const result = await generateAiCourse(request);
      if (result.ok) {
        setDraft(result.draft);
      } else {
        setError(result.error);
      }
    });
  }

  function handleRegenerate() {
    setDraft(null);
    handleGenerate();
  }

  function handleImport() {
    if (!draft) return;
    startImport(async () => {
      const result = await importAiCourse(draft);
      if (result.ok && result.course) {
        router.push(`/admin/courses/${result.course.id}`);
      } else {
        setError(result.error ?? "Erreur lors de l'import du cours.");
      }
    });
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Form card */}
      {!generating && !draft && (
        <GlassCard variant="strong">
          <GlassCardHeader className="px-6 pt-6 pb-0">
            <GlassCardTitle>Décrire le cours</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="p-6 space-y-6">
            {/* Topic */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">
                Sujet <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canGenerate && handleGenerate()}
                placeholder="ex: Introduction à React, Les bases de SQL, Docker pour les débutants…"
                maxLength={200}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-text placeholder:text-text-soft outline-none transition-colors focus:border-accent/50 focus:bg-white/8"
              />
              <p className="text-xs text-muted">{topic.trim().length}/200 — minimum 5 caractères</p>
            </div>

            {/* Level */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">Niveau</label>
              <div className="grid gap-2 sm:grid-cols-3">
                {LEVELS.map(({ value, label, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLevel(value)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-all",
                      level === value
                        ? "border-accent/60 bg-accent/10 text-accent"
                        : "border-white/10 bg-white/5 text-text hover:border-white/20 hover:bg-white/8"
                    )}
                  >
                    <div className="text-sm font-medium">{label}</div>
                    <div className="mt-0.5 text-[11px] opacity-70">{description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">Langue du contenu</label>
              <div className="flex gap-2">
                {(["fr", "en"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      "rounded-lg border px-5 py-2 text-sm font-medium transition-all",
                      language === lang
                        ? "border-accent/60 bg-accent/10 text-accent"
                        : "border-white/10 bg-white/5 text-text hover:border-white/20"
                    )}
                  >
                    {lang === "fr" ? "Français" : "English"}
                  </button>
                ))}
              </div>
            </div>

            {/* Key ideas */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">
                Idées clés à couvrir{" "}
                <span className="font-normal text-muted">(optionnel, max 10)</span>
              </label>
              <KeyIdeasInput ideas={keyIdeas} onChange={setKeyIdeas} />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <GlassButton
              variant="primary"
              size="lg"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full"
            >
              <SparklesIcon size={16} />
              Générer le cours
            </GlassButton>
          </GlassCardContent>
        </GlassCard>
      )}

      {/* Loading state */}
      {generating && <GeneratingAnimation />}

      {/* Error after generation attempt */}
      {!generating && error && !draft && (
        <div className="space-y-4">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
          <GlassButton variant="ghost" onClick={() => { setError(null); }}>
            ← Modifier les paramètres
          </GlassButton>
        </div>
      )}

      {/* Draft result */}
      {!generating && draft && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircleIcon size={16} />
              Cours généré avec succès
            </div>
            <GlassButton variant="ghost" size="sm" onClick={() => { setDraft(null); setError(null); }}>
              ← Modifier les paramètres
            </GlassButton>
          </div>
          <DraftPreview
            draft={draft}
            onImport={handleImport}
            onRegenerate={handleRegenerate}
            importing={importing}
          />
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
