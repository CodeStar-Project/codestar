"use client";

/**
 * Magnetic — l'enfant est légèrement attiré vers le curseur quand il
 * l'approche, puis revient en place avec un ressort doux. Effet discret
 * (amplitude faible) pour des CTA un peu hors du commun, sans surcharge.
 * No-op sous `prefers-reduced-motion`.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

interface MagneticProps {
  children: React.ReactNode;
  /** Amplitude max du déplacement, en px. */
  strength?: number;
  className?: string;
}

export function Magnetic({
  children,
  strength = 14,
  className,
}: MagneticProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
      });
    };
    const reset = () => {
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = "translate3d(0, 0, 0)";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div
      ref={ref}
      className={cn("transition-transform duration-300 ease-out", className)}
    >
      {children}
    </div>
  );
}
