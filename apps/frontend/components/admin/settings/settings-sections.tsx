"use client";

// Settings sections: identity, theme, hero/SEO, access, media, AI.

import * as React from "react";
import { useTranslations } from "next-intl";

import { ImageUploader } from "@/components/block-kinds/image-uploader";
import { BrandMark } from "@/components/brand-mark";
import {
  ColorField,
  GlassToggle,
  RangeField,
} from "@/components/ui/glass-controls";
import {
  GlassField,
  GlassInput,
  GlassSelect,
  GlassTextarea,
} from "@/components/ui/glass-input";
import { GlassChip } from "@/components/ui/glass-chip";
import { ImageIcon, KeyIcon } from "@/components/ui/icons";
import { FONT_PRESETS } from "@/lib/fonts";
import type {
  InstanceBranding,
  InstanceSettings,
  ThemeTokens,
} from "@/lib/types";

type ThemeMode = "light" | "dark";

const LOGO_PRESETS = ["star", "alpha", "flame", "hash"] as const;
const LOCALES = ["en", "fr"] as const;

export interface BrandingSectionProps {
  branding: InstanceBranding;
  patch: (partial: Partial<InstanceBranding>) => void;
}

export interface SettingsSectionProps {
  settings: InstanceSettings;
  patch: (partial: Partial<InstanceSettings>) => void;
}

/* ===================== Identity ===================== */

/** Small two-option segmented control. */
function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={
            "cursor-pointer rounded-full px-3.5 py-1.5 text-[0.8rem] font-medium transition-colors duration-150 " +
            (value === o.id
              ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
              : "text-text-soft hover:text-text")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function LogoField({ branding, patch }: BrandingSectionProps) {
  const t = useTranslations("adminSettings.identity");
  const isImage = branding.logo.kind !== "preset";
  const [mode, setMode] = React.useState<"preset" | "image">(
    isImage ? "image" : "preset"
  );

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[0.8rem] font-medium text-text-soft">
          {t("logo")}
        </span>
        <Segmented
          ariaLabel={t("logo")}
          value={mode}
          onChange={(m) => {
            setMode(m);
            // Switching back to preset restores a default glyph.
            if (m === "preset" && branding.logo.kind !== "preset") {
              patch({ logo: { kind: "preset", value: "star" } });
            }
          }}
          options={[
            { id: "preset", label: t("logoMode.preset") },
            { id: "image", label: t("logoMode.image") },
          ]}
        />
      </div>

      {mode === "preset" ? (
        <GlassSelect
          id="b-logo"
          value={branding.logo.kind === "preset" ? branding.logo.value : "star"}
          onChange={(e) =>
            patch({ logo: { kind: "preset", value: e.target.value } })
          }
        >
          {LOGO_PRESETS.map((p) => (
            <option key={p} value={p}>
              {t(`logoPreset.${p}`)}
            </option>
          ))}
        </GlassSelect>
      ) : (
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--r-sm)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)]">
            <BrandMark size={32} logo={branding.logo} accent={branding.accent} />
          </span>
          <div className="min-w-0 flex-1">
            <ImageUploader
              label={isImage ? t("logoReplace") : t("logoUpload")}
              errorLabel={t("uploadError")}
              onUploaded={(url) => patch({ logo: { kind: "upload", value: url } })}
            />
          </div>
        </div>
      )}
      <p className="mt-1.5 text-[0.78rem] text-muted">{t("logoHelper")}</p>
    </div>
  );
}

export function IdentitySection({ branding, patch }: BrandingSectionProps) {
  const t = useTranslations("adminSettings.identity");
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <GlassField label={t("name")} htmlFor="b-name">
          <GlassInput
            id="b-name"
            value={branding.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </GlassField>
        <GlassField label={t("tagline")} htmlFor="b-tagline">
          <GlassInput
            id="b-tagline"
            value={branding.tagline}
            onChange={(e) => patch({ tagline: e.target.value })}
          />
        </GlassField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <LogoField branding={branding} patch={patch} />
        <GlassField label={t("locale")} htmlFor="b-locale">
          <GlassSelect
            id="b-locale"
            value={branding.locale}
            onChange={(e) => patch({ locale: e.target.value })}
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {t(`localeOption.${l}`)}
              </option>
            ))}
          </GlassSelect>
        </GlassField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <ColorField
          id="b-accent"
          label={t("accent")}
          value={branding.accent}
          onChange={(hex) => patch({ accent: hex })}
          helper={t("accentHelper")}
        />
        <GlassField label={t("font")} htmlFor="b-font" helper={t("fontHelper")}>
          <GlassSelect
            id="b-font"
            value={branding.fontPreset}
            onChange={(e) => patch({ fontPreset: e.target.value })}
          >
            {FONT_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </GlassSelect>
        </GlassField>
      </div>
    </div>
  );
}

/* ===================== Theme ===================== */

const TOKEN_GROUPS: {
  group: "backgrounds" | "text" | "status";
  keys: (keyof ThemeTokens)[];
}[] = [
  { group: "backgrounds", keys: ["bgBase", "bgMesh1", "bgMesh2", "bgMesh3"] },
  { group: "text", keys: ["text", "textSoft", "muted"] },
  { group: "status", keys: ["success", "warning", "danger", "green", "tip"] },
];

export interface ThemeSectionProps extends BrandingSectionProps {
  mode: ThemeMode;
  onMode: (m: ThemeMode) => void;
}

export function ThemeSection({
  branding,
  patch,
  mode,
  onMode,
}: ThemeSectionProps) {
  const t = useTranslations("adminSettings.theme");
  const tokens = branding.theme[mode];

  function setToken(key: keyof ThemeTokens, value: string) {
    patch({
      theme: {
        ...branding.theme,
        [mode]: { ...branding.theme[mode], [key]: value },
      },
    });
  }

  return (
    <div className="space-y-5">
      <div
        role="group"
        aria-label={t("modeSwitch")}
        className="inline-flex rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] p-0.5"
      >
        {(["light", "dark"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => onMode(m)}
            className={
              "cursor-pointer rounded-full px-4 py-1.5 text-[0.8rem] font-medium capitalize transition-colors duration-150 " +
              (mode === m
                ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                : "text-text-soft hover:text-text")
            }
          >
            {t(m)}
          </button>
        ))}
      </div>

      {TOKEN_GROUPS.map(({ group, keys }) => (
        <fieldset key={group} className="space-y-3">
          <legend className="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            {t(`group.${group}`)}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {keys.map((key) => (
              <ColorField
                key={key}
                id={`tk-${mode}-${key}`}
                label={t(`token.${key}`)}
                helper={t(`tokenDesc.${key}`)}
                value={tokens[key]}
                onChange={(hex) => setToken(key, hex)}
              />
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

/* ===================== Hero & SEO ===================== */

function CharCount({ value, max }: { value: string; max: number }) {
  return (
    <span className="font-mono text-[0.72rem] tabular-nums text-muted">
      {value.length}/{max}
    </span>
  );
}

export function HeroSeoSection({ branding, patch }: BrandingSectionProps) {
  const t = useTranslations("adminSettings.hero");
  const metaTitle = branding.metaTitle ?? "";
  const metaDesc = branding.metaDescription ?? "";

  return (
    <div className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
          {t("heroGroup")}
        </legend>
        <GlassField label={t("heroTitle")} htmlFor="h-title" helper={t("heroTitleHelper")}>
          <GlassInput
            id="h-title"
            value={branding.heroTitle ?? ""}
            onChange={(e) =>
              patch({ heroTitle: e.target.value || null })
            }
          />
        </GlassField>
        <GlassField label={t("heroSubtitle")} htmlFor="h-sub">
          <GlassTextarea
            id="h-sub"
            rows={2}
            value={branding.heroSubtitle ?? ""}
            onChange={(e) =>
              patch({ heroSubtitle: e.target.value || null })
            }
          />
        </GlassField>
        <GlassField label={t("heroCta")} htmlFor="h-cta">
          <GlassInput
            id="h-cta"
            value={branding.heroCta ?? ""}
            onChange={(e) => patch({ heroCta: e.target.value || null })}
          />
        </GlassField>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
          {t("seoGroup")}
        </legend>
        <GlassField
          label={
            <span className="flex items-center justify-between">
              {t("metaTitle")}
              <CharCount value={metaTitle} max={60} />
            </span>
          }
          htmlFor="m-title"
          helper={t("metaTitleHelper")}
        >
          <GlassInput
            id="m-title"
            maxLength={70}
            value={metaTitle}
            onChange={(e) => patch({ metaTitle: e.target.value || null })}
          />
        </GlassField>
        <GlassField
          label={
            <span className="flex items-center justify-between">
              {t("metaDescription")}
              <CharCount value={metaDesc} max={160} />
            </span>
          }
          htmlFor="m-desc"
          helper={t("metaDescriptionHelper")}
        >
          <GlassTextarea
            id="m-desc"
            rows={3}
            maxLength={180}
            value={metaDesc}
            onChange={(e) =>
              patch({ metaDescription: e.target.value || null })
            }
          />
        </GlassField>
        <GlassField label={t("favicon")} htmlFor="m-favicon" helper={t("faviconHelper")}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[var(--r-sm)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)]">
              {branding.favicon ? (
                <img
                  src={branding.favicon}
                  alt=""
                  className="h-7 w-7 object-contain"
                />
              ) : (
                <ImageIcon size={18} />
              )}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <GlassInput
                id="m-favicon"
                type="url"
                inputMode="url"
                placeholder="https://…/favicon.ico"
                value={branding.favicon ?? ""}
                onChange={(e) => patch({ favicon: e.target.value || null })}
              />
              <ImageUploader
                label={t("faviconUpload")}
                errorLabel={t("uploadError")}
                onUploaded={(url) => patch({ favicon: url })}
              />
            </div>
          </div>
        </GlassField>
      </fieldset>
    </div>
  );
}

/* ===================== Access ===================== */

export function AccessSection({ settings, patch }: SettingsSectionProps) {
  const t = useTranslations("adminSettings.access");
  return (
    <div className="space-y-5">
      <GlassToggle
        id="s-signup"
        checked={settings.signupOpen}
        onChange={(v) => patch({ signupOpen: v })}
        label={t("signupOpen")}
        description={t("signupOpenHelper")}
        stateLabel={{ on: t("open"), off: t("closed") }}
      />
    </div>
  );
}

/* ===================== Media ===================== */

export function MediaSection({ settings, patch }: SettingsSectionProps) {
  const t = useTranslations("adminSettings.media");
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <GlassField
        label={t("userQuota")}
        htmlFor="s-user-quota"
        helper={t("userQuotaHelper")}
      >
        <div className="relative">
          <GlassInput
            id="s-user-quota"
            type="number"
            min={1}
            className="pr-12"
            value={settings.mediaUserQuotaMb}
            onChange={(e) =>
              patch({ mediaUserQuotaMb: Number(e.target.value) })
            }
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[0.8rem] text-muted">
            MB
          </span>
        </div>
      </GlassField>
      <GlassField
        label={t("instanceQuota")}
        htmlFor="s-instance-quota"
        helper={t("instanceQuotaHelper")}
      >
        <div className="relative">
          <GlassInput
            id="s-instance-quota"
            type="number"
            min={1}
            className="pr-12"
            value={settings.mediaInstanceQuotaMb}
            onChange={(e) =>
              patch({ mediaInstanceQuotaMb: Number(e.target.value) })
            }
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[0.8rem] text-muted">
            MB
          </span>
        </div>
      </GlassField>
    </div>
  );
}

/* ===================== AI ===================== */

export interface AiSectionProps extends SettingsSectionProps {
  apiKey: string;
  onApiKey: (v: string) => void;
}

export function AiSection({
  settings,
  patch,
  apiKey,
  onApiKey,
}: AiSectionProps) {
  const t = useTranslations("adminSettings.ai");
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <GlassField label={t("apiUrl")} htmlFor="ai-url">
          <GlassInput
            id="ai-url"
            type="url"
            inputMode="url"
            placeholder="https://api.openai.com/v1"
            value={settings.aiApiUrl}
            onChange={(e) => patch({ aiApiUrl: e.target.value })}
          />
        </GlassField>
        <GlassField label={t("model")} htmlFor="ai-model">
          <GlassInput
            id="ai-model"
            value={settings.aiModel}
            onChange={(e) => patch({ aiModel: e.target.value })}
          />
        </GlassField>
      </div>

      <GlassField
        label={
          <span className="flex items-center gap-2">
            {t("apiKey")}
            {settings.aiApiKeySet ? (
              <GlassChip size="sm" variant="success">
                <KeyIcon size={11} />
                {t("keyConfigured")}
              </GlassChip>
            ) : (
              <GlassChip size="sm" variant="warning">
                {t("keyMissing")}
              </GlassChip>
            )}
          </span>
        }
        htmlFor="ai-key"
        helper={t("apiKeyHelper")}
      >
        <GlassInput
          id="ai-key"
          type="password"
          autoComplete="off"
          placeholder={
            settings.aiApiKeySet ? t("keyPlaceholderSet") : t("keyPlaceholder")
          }
          value={apiKey}
          onChange={(e) => onApiKey(e.target.value)}
        />
      </GlassField>

      <div className="grid gap-6 sm:grid-cols-2">
        <RangeField
          id="ai-temp"
          label={t("temperature")}
          value={settings.aiTemperature}
          min={0}
          max={2}
          step={0.1}
          onChange={(v) => patch({ aiTemperature: v })}
          format={(v) => v.toFixed(1)}
          helper={t("temperatureHelper")}
        />
        <RangeField
          id="ai-tokens"
          label={t("maxTokens")}
          value={settings.aiMaxTokens}
          min={256}
          max={32000}
          step={256}
          onChange={(v) => patch({ aiMaxTokens: v })}
          format={(v) => v.toLocaleString()}
          helper={t("maxTokensHelper")}
        />
      </div>
    </div>
  );
}
