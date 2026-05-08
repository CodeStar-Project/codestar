import type { CSSProperties } from "react";

/**
 * Returns the inline-style object that delays a `data-reveal` element's
 * fade-up animation. Server- and client-safe — the actual scroll observer
 * lives in `<RevealOnScroll />`.
 */
export const revealDelay = (ms: number): CSSProperties =>
  ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;
