"use client";

/**
 * SlideToConfirm — on valide en faisant glisser la poignée jusqu'au bout,
 * au lieu d'un simple clic. Fantaisie maîtrisée : geste volontaire, retour
 * élastique si on relâche trop tôt, état « confirmé » puis chargement.
 *
 * Accessibilité :
 * - la poignée est un bouton focusable (rôle slider) ;
 * - au clavier : ←/→ déplacent, Entrée/Espace confirment directement ;
 * - `prefers-reduced-motion` → bascule en bouton plein classique (1 clic).
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";

interface SlideToConfirmProps {
  onConfirm: () => void;
  label: string;
  confirmedLabel: string;
  /** Libellé accessible de l'action (ex. « Créer mon compte »). */
  ariaLabel: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const THRESHOLD = 0.9;

function usePrefersReducedMotion() {
  return React.useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

const Spinner = () => (
  <svg
    className="animate-spin"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeOpacity="0.3"
    />
    <path
      d="M21 12a9 9 0 0 1-9 9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export function SlideToConfirm({
  onConfirm,
  label,
  confirmedLabel,
  ariaLabel,
  loading = false,
  disabled = false,
  className,
}: SlideToConfirmProps) {
  const [progress, setProgress] = React.useState(0); // 0 → 1
  const [confirmed, setConfirmed] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const reduce = usePrefersReducedMotion();

  const trackRef = React.useRef<HTMLDivElement>(null);
  const confirmedRef = React.useRef(false);

  const fire = React.useCallback(() => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;
    setConfirmed(true);
    setDragging(false);
    setProgress(1);
    onConfirm();
  }, [onConfirm]);

  // Après une tentative, on réarme la poignée si on est toujours là
  // (échec de validation / d'auth). En cas de succès, le composant est
  // démonté par la navigation — aucun reset visible.
  React.useEffect(() => {
    if (!confirmed || loading) return;
    const id = window.setTimeout(() => {
      confirmedRef.current = false;
      setConfirmed(false);
      setProgress(0);
    }, 650);
    return () => window.clearTimeout(id);
  }, [confirmed, loading]);

  const locked = disabled || loading || confirmed;

  const computeProgress = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const usable = rect.width - rect.height; // largeur moins la poignée
    if (usable <= 0) return 0;
    return Math.min(
      1,
      Math.max(0, (clientX - rect.left - rect.height / 2) / usable)
    );
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (locked) return;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setProgress(computeProgress(e.clientX));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || locked) return;
    const p = computeProgress(e.clientX);
    setProgress(p);
    if (p >= THRESHOLD) fire();
  };

  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    if (!confirmedRef.current) setProgress(0); // retour élastique
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (locked) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fire();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setProgress((p) => {
        const next = Math.min(1, p + 0.2);
        if (next >= THRESHOLD) fire();
        return next;
      });
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setProgress((p) => Math.max(0, p - 0.2));
    }
  };

  // ── Fallback mouvement réduit : bouton plein classique ──
  if (reduce) {
    return (
      <button
        type="button"
        onClick={() => !locked && fire()}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex h-14 w-full items-center justify-center gap-2 rounded-full font-medium",
          "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
      >
        {loading ? <Spinner /> : confirmed ? confirmedLabel : label}
      </button>
    );
  }

  const pct = Math.round(progress * 100);
  const settle = !dragging;

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-14 w-full select-none overflow-hidden rounded-full",
        "border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)] backdrop-blur-md",
        locked && !confirmed && "opacity-50",
        className
      )}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
    >
      {/* Remplissage accent qui suit la poignée. */}
      <div
        className={cn(
          "fx-track-flow absolute inset-y-0 left-0 rounded-full",
          settle && "transition-[width] duration-300 ease-out"
        )}
        style={{ width: `calc(${pct}% + 3.5rem)` }}
        aria-hidden
      />

      {/* Libellé centré, qui s'efface à mesure qu'on glisse. */}
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center pl-8 text-[0.95rem] font-medium text-text-soft"
        style={{ opacity: confirmed ? 0 : 1 - progress * 1.4 }}
        aria-hidden
      >
        {label}
      </span>
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-[0.95rem] font-semibold text-[color:var(--color-accent-fg)]"
        style={{ opacity: confirmed ? 1 : 0 }}
        aria-hidden
      >
        {confirmedLabel}
      </span>

      {/* Poignée. */}
      <button
        type="button"
        role="slider"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-disabled={disabled || loading || undefined}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className={cn(
          "absolute top-1 bottom-1 flex aspect-square items-center justify-center rounded-full",
          "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] shadow-md",
          "touch-none cursor-grab active:cursor-grabbing",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2",
          settle && "transition-[left] duration-300 ease-out"
        )}
        style={{ left: `calc(${pct}% * 0.86 + 0.25rem)` }}
      >
        {loading ? (
          <Spinner />
        ) : confirmed ? (
          <CheckIcon size={20} className="fx-pop" />
        ) : (
          <ArrowRightIcon size={20} />
        )}
      </button>
    </div>
  );
}
