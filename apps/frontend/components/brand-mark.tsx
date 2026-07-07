/**
 * Logo / mark de l'instance — étoile par défaut.
 * Le logo (preset ou image téléversée) et l'accent proviennent du branding (Settings).
 */

import * as React from "react";

import { DEFAULT_INSTANCE } from "@/lib/instance";

export type LogoPreset = "star" | "alpha" | "flame" | "hash";

interface BrandMarkProps {
  size?: number;
  accent?: string;
  /** Full logo descriptor; when kind !== "preset", `value` is an image URL. */
  logo?: { kind: string; value: string };
  /** Legacy: preset name when no `logo` object is provided. */
  preset?: LogoPreset;
  className?: string;
}

const PRESET_GLYPH: Record<LogoPreset, string | null> = {
  star: null, // SVG dédié
  alpha: "α",
  flame: "✦",
  hash: "#",
};

export function BrandMark({
  size = 28,
  accent = DEFAULT_INSTANCE.accent,
  logo,
  preset,
  className,
}: BrandMarkProps) {
  // Uploaded / URL logo wins over presets.
  const imageSrc =
    logo && logo.kind !== "preset" && logo.value ? logo.value : null;

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt=""
        width={size}
        height={size}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.3,
          objectFit: "contain",
        }}
      />
    );
  }

  const presetName: LogoPreset =
    (logo?.kind === "preset" ? (logo.value as LogoPreset) : undefined) ??
    preset ??
    (DEFAULT_INSTANCE.logo.value as LogoPreset);

  const glyph = PRESET_GLYPH[presetName];
  const gradientID = "mark-" + String(accent).replace(/[^a-zA-Z0-9_-]/g, "");

  if (glyph) {
    return (
      <span
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.3,
          background: accent,
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.55,
          fontWeight: 700,
          lineHeight: 1,
        }}
        aria-hidden
      >
        {glyph}
      </span>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientID} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={accent} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 L14.5 9 L22 10 L16 15 L17.6 22 L12 18 L6.4 22 L8 15 L2 10 L9.5 9 Z"
        fill={`url(#${gradientID})`}
      />
      <circle cx="12" cy="12" r="2.4" fill="var(--color-bg-base)" />
    </svg>
  );
}
