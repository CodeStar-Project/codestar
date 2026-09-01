"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { GlassFieldHelper, GlassLabel } from "./glass-input";

/* ============================================================
   Glass form controls: toggle switch, color field, range slider.
   Built on the same glass tokens as GlassInput.
   ============================================================ */

/* ---- Toggle (switch) ---- */

interface GlassToggleProps {
  id?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Short text shown next to the switch reflecting the current state. */
  stateLabel?: { on: string; off: string };
  disabled?: boolean;
}

export function GlassToggle({
  id,
  checked,
  onChange,
  label,
  description,
  stateLabel,
  disabled,
}: GlassToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <GlassLabel htmlFor={id} className="mb-0.5">
          {label}
        </GlassLabel>
        {description && <GlassFieldHelper>{description}</GlassFieldHelper>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {stateLabel && (
          <span
            className={cn(
              "text-[0.78rem] font-medium tabular-nums",
              checked
                ? "text-[color:var(--color-success)]"
                : "text-muted"
            )}
          >
            {checked ? stateLabel.on : stateLabel.off}
          </span>
        )}
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
            "border border-[color:var(--glass-border)] transition-colors duration-200",
            "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--color-accent-soft)]",
            "disabled:cursor-not-allowed disabled:opacity-60",
            checked
              ? "bg-[color:var(--color-accent)]"
              : "bg-[color:var(--glass-bg-strong)]"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
              checked ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>
    </div>
  );
}

/* ---- Color field (swatch + hex) ---- */

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isHexColor(v: string): boolean {
  return HEX_RE.test(v.trim());
}

interface ColorFieldProps {
  id?: string;
  label: React.ReactNode;
  value: string;
  onChange: (hex: string) => void;
  helper?: React.ReactNode;
}

export function ColorField({
  id,
  label,
  value,
  onChange,
  helper,
}: ColorFieldProps) {
  const valid = isHexColor(value);
  // Native <input type=color> only accepts 6-digit hex.
  const swatchValue = valid && value.length === 7 ? value : "#000000";

  return (
    <div className="group w-full">
      <GlassLabel htmlFor={id}>
        <span className="transition-colors group-focus-within:text-[color:var(--color-accent)]">
          {label}
        </span>
      </GlassLabel>
      <div className="flex items-center gap-2">
        <span className="relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-[var(--r-sm)] border border-[color:var(--glass-border)]">
          <input
            id={id}
            type="color"
            aria-label={typeof label === "string" ? label : undefined}
            value={swatchValue}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-[-25%] h-[150%] w-[150%] cursor-pointer border-0 bg-transparent p-0"
          />
        </span>
        <input
          type="text"
          inputMode="text"
          spellCheck={false}
          aria-label={
            typeof label === "string" ? `${label} (hex)` : undefined
          }
          aria-invalid={!valid || undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-10 w-32 rounded-[var(--r-sm)] px-3 font-mono text-[0.85rem] text-text",
            "border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)]",
            "transition-[box-shadow,border-color] duration-150",
            "focus:border-[color:var(--color-accent)] focus:outline-none",
            "focus:shadow-[0_0_0_3px_var(--color-accent-soft)]",
            !valid &&
              "border-[color:var(--color-danger)] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-danger)_30%,transparent)]"
          )}
        />
      </div>
      {helper && <GlassFieldHelper>{helper}</GlassFieldHelper>}
    </div>
  );
}

/* ---- Range slider ---- */

interface RangeFieldProps {
  id?: string;
  label: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  /** Render the value (e.g. add a unit). Defaults to the raw number. */
  format?: (v: number) => string;
  helper?: React.ReactNode;
}

export function RangeField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  helper,
}: RangeFieldProps) {
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <GlassLabel htmlFor={id} className="mb-0">
          {label}
        </GlassLabel>
        <span className="font-mono text-[0.85rem] tabular-nums text-text">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--color-accent-soft)] accent-[color:var(--color-accent)]"
      />
      {helper && <GlassFieldHelper>{helper}</GlassFieldHelper>}
    </div>
  );
}
