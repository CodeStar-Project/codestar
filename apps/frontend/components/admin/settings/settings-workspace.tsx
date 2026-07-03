"use client";

// Admin settings editor — section rail, dirty-tracking save bar, live branding preview.

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { updateBranding } from "@/app/actions/instance";
import { updateSettings } from "@/app/actions/settings";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CodeIcon,
  ImageIcon,
  KeyIcon,
  SparklesIcon,
  StarIcon,
  TypeIcon,
} from "@/components/ui/icons";
import { DEFAULT_INSTANCE, DEFAULT_THEME_TOKENS } from "@/lib/instance";
import { cn } from "@/lib/utils";
import type {
  InstanceBranding,
  InstanceSettings,
  UpdateBrandingPayload,
  UpdateSettingsPayload,
} from "@/lib/types";

import {
  AccessSection,
  AiSection,
  HeroSeoSection,
  IdentitySection,
  MediaSection,
  ThemeSection,
} from "./settings-sections";

// Default values used by the per-section reset (platform settings side).
const DEFAULT_SETTINGS: Pick<
  InstanceSettings,
  | "signupOpen"
  | "mediaUserQuotaMb"
  | "mediaInstanceQuotaMb"
  | "aiApiUrl"
  | "aiModel"
  | "aiMaxTokens"
  | "aiTemperature"
> = {
  signupOpen: true,
  mediaUserQuotaMb: 100,
  mediaInstanceQuotaMb: 5000,
  aiApiUrl: "",
  aiModel: "",
  aiMaxTokens: 4096,
  aiTemperature: 0.7,
};

type SectionId =
  | "identity"
  | "theme"
  | "hero"
  | "access"
  | "media"
  | "ai";

const SECTIONS: {
  id: SectionId;
  icon: React.ComponentType<{ size?: number }>;
}[] = [
  { id: "identity", icon: StarIcon },
  { id: "theme", icon: SparklesIcon },
  { id: "hero", icon: TypeIcon },
  { id: "access", icon: KeyIcon },
  { id: "media", icon: ImageIcon },
  { id: "ai", icon: CodeIcon },
];

/* ---- diff helpers (only send changed fields) ---- */

function brandingDiff(
  a: InstanceBranding,
  b: InstanceBranding
): UpdateBrandingPayload {
  const out: UpdateBrandingPayload = {};
  if (a.name !== b.name) out.name = b.name;
  if (a.tagline !== b.tagline) out.tagline = b.tagline;
  if (a.logo.kind !== b.logo.kind || a.logo.value !== b.logo.value)
    out.logo = b.logo;
  if (a.accent !== b.accent) out.accent = b.accent;
  if (a.heroTitle !== b.heroTitle) out.heroTitle = b.heroTitle;
  if (a.heroSubtitle !== b.heroSubtitle) out.heroSubtitle = b.heroSubtitle;
  if (a.heroCta !== b.heroCta) out.heroCta = b.heroCta;
  if (a.locale !== b.locale) out.locale = b.locale;
  if (a.favicon !== b.favicon) out.favicon = b.favicon;
  if (a.metaTitle !== b.metaTitle) out.metaTitle = b.metaTitle;
  if (a.metaDescription !== b.metaDescription)
    out.metaDescription = b.metaDescription;
  if (a.fontPreset !== b.fontPreset) out.fontPreset = b.fontPreset;
  if (JSON.stringify(a.theme) !== JSON.stringify(b.theme)) out.theme = b.theme;
  return out;
}

function settingsDiff(
  a: InstanceSettings,
  b: InstanceSettings
): UpdateSettingsPayload {
  const out: UpdateSettingsPayload = {};
  if (a.signupOpen !== b.signupOpen) out.signupOpen = b.signupOpen;
  if (a.mediaUserQuotaMb !== b.mediaUserQuotaMb)
    out.mediaUserQuotaMb = b.mediaUserQuotaMb;
  if (a.mediaInstanceQuotaMb !== b.mediaInstanceQuotaMb)
    out.mediaInstanceQuotaMb = b.mediaInstanceQuotaMb;
  if (a.aiApiUrl !== b.aiApiUrl) out.aiApiUrl = b.aiApiUrl;
  if (a.aiModel !== b.aiModel) out.aiModel = b.aiModel;
  if (a.aiMaxTokens !== b.aiMaxTokens) out.aiMaxTokens = b.aiMaxTokens;
  if (a.aiTemperature !== b.aiTemperature) out.aiTemperature = b.aiTemperature;
  return out;
}

function hasKeys(o: object): boolean {
  return Object.keys(o).length > 0;
}

export function SettingsWorkspace({
  initialBranding,
  initialSettings,
}: {
  initialBranding: InstanceBranding;
  initialSettings: InstanceSettings;
}) {
  const t = useTranslations("adminSettings");
  const tErr = useTranslations("errors");
  const router = useRouter();

  const [savedBranding, setSavedBranding] = React.useState(initialBranding);
  const [savedSettings, setSavedSettings] = React.useState(initialSettings);
  const [branding, setBranding] = React.useState(initialBranding);
  const [settings, setSettings] = React.useState(initialSettings);
  const [apiKey, setApiKey] = React.useState("");

  const [active, setActive] = React.useState<SectionId>("identity");
  // Light/dark mode currently edited in the Theme section.
  const [themeMode, setThemeMode] = React.useState<"light" | "dark">("light");
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const bDiff = brandingDiff(savedBranding, branding);
  const sDiff = settingsDiff(savedSettings, settings);
  const apiKeyDirty = apiKey.trim().length > 0;
  const dirty = hasKeys(bDiff) || hasKeys(sDiff) || apiKeyDirty;

  const dirtySections = React.useMemo(() => {
    const s = new Set<SectionId>();
    if (
      bDiff.name !== undefined ||
      bDiff.tagline !== undefined ||
      bDiff.logo !== undefined ||
      bDiff.accent !== undefined ||
      bDiff.locale !== undefined ||
      bDiff.fontPreset !== undefined
    )
      s.add("identity");
    if (bDiff.theme !== undefined) s.add("theme");
    if (
      bDiff.heroTitle !== undefined ||
      bDiff.heroSubtitle !== undefined ||
      bDiff.heroCta !== undefined ||
      bDiff.metaTitle !== undefined ||
      bDiff.metaDescription !== undefined ||
      bDiff.favicon !== undefined
    )
      s.add("hero");
    if (sDiff.signupOpen !== undefined) s.add("access");
    if (
      sDiff.mediaUserQuotaMb !== undefined ||
      sDiff.mediaInstanceQuotaMb !== undefined
    )
      s.add("media");
    if (
      sDiff.aiApiUrl !== undefined ||
      sDiff.aiModel !== undefined ||
      sDiff.aiMaxTokens !== undefined ||
      sDiff.aiTemperature !== undefined ||
      apiKeyDirty
    )
      s.add("ai");
    return s;
  }, [bDiff, sDiff, apiKeyDirty]);

  const patchBranding = React.useCallback(
    (partial: Partial<InstanceBranding>) => {
      setSaved(false);
      setBranding((prev) => ({ ...prev, ...partial }));
    },
    []
  );
  const patchSettings = React.useCallback(
    (partial: Partial<InstanceSettings>) => {
      setSaved(false);
      setSettings((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  function discard() {
    setBranding(savedBranding);
    setSettings(savedSettings);
    setApiKey("");
    setError(null);
    setSaved(false);
  }

  // Reset the active section's fields back to their default values.
  function resetSection(id: SectionId) {
    switch (id) {
      case "identity":
        patchBranding({
          name: DEFAULT_INSTANCE.name,
          tagline: DEFAULT_INSTANCE.tagline,
          logo: DEFAULT_INSTANCE.logo,
          accent: DEFAULT_INSTANCE.accent,
          locale: DEFAULT_INSTANCE.locale,
          fontPreset: DEFAULT_INSTANCE.fontPreset,
        });
        break;
      case "theme":
        patchBranding({
          theme: {
            light: { ...DEFAULT_THEME_TOKENS.light },
            dark: { ...DEFAULT_THEME_TOKENS.dark },
          },
        });
        break;
      case "hero":
        patchBranding({
          heroTitle: null,
          heroSubtitle: null,
          heroCta: null,
          metaTitle: null,
          metaDescription: null,
          favicon: null,
        });
        break;
      case "access":
        patchSettings({ signupOpen: DEFAULT_SETTINGS.signupOpen });
        break;
      case "media":
        patchSettings({
          mediaUserQuotaMb: DEFAULT_SETTINGS.mediaUserQuotaMb,
          mediaInstanceQuotaMb: DEFAULT_SETTINGS.mediaInstanceQuotaMb,
        });
        break;
      case "ai":
        patchSettings({
          aiApiUrl: DEFAULT_SETTINGS.aiApiUrl,
          aiModel: DEFAULT_SETTINGS.aiModel,
          aiMaxTokens: DEFAULT_SETTINGS.aiMaxTokens,
          aiTemperature: DEFAULT_SETTINGS.aiTemperature,
        });
        setApiKey("");
        break;
    }
  }

  function save() {
    setError(null);
    setSaved(false);
    start(async () => {
      // Branding
      if (hasKeys(bDiff)) {
        const r = await updateBranding(bDiff);
        if (!r.ok) {
          setError(r.error ?? tErr("unknown"));
          return;
        }
        if (r.data) {
          setSavedBranding(r.data);
          setBranding(r.data);
        } else {
          setSavedBranding(branding);
        }
      }
      // Platform settings (+ optional write-only key)
      const settingsPayload: UpdateSettingsPayload = { ...sDiff };
      if (apiKeyDirty) settingsPayload.aiApiKey = apiKey.trim();
      if (hasKeys(settingsPayload)) {
        const r = await updateSettings(settingsPayload);
        if (!r.ok) {
          setError(r.error ?? tErr("unknown"));
          return;
        }
        if (r.data) {
          setSavedSettings(r.data);
          setSettings(r.data);
        } else {
          setSavedSettings(settings);
        }
      }
      setApiKey("");
      setSaved(true);
      // Propagate branding (accent/theme/fonts/favicon) to the root layout.
      router.refresh();
    });
  }

  return (
    <div className="lg:grid lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-6">
      {/* ── Rail nav ── */}
      <nav
        aria-label={t("title")}
        className="mb-4 lg:mb-0"
      >
        <ul className="flex gap-1 overflow-x-auto pb-1 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible lg:pb-0">
          {SECTIONS.map(({ id, icon: Icon }) => {
            const isActive = active === id;
            const sectionDirty = dirtySections.has(id);
            return (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setActive(id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[var(--r)] px-3 py-2.5 text-left",
                    "text-[0.9rem] font-medium transition-colors duration-150 cursor-pointer",
                    isActive
                      ? "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]"
                      : "text-text-soft hover:bg-[color:var(--glass-bg)] hover:text-text"
                  )}
                >
                  <Icon size={17} />
                  <span className="whitespace-nowrap">{t(`nav.${id}`)}</span>
                  {sectionDirty && (
                    <span
                      aria-hidden
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Content ── */}
      <div className="min-w-0">
        {/* Save bar — opaque backing so scrolled content never shows through. */}
        <div
          className={cn(
            "sticky top-20 z-30 mb-5 rounded-[var(--r-lg)] bg-bg-base shadow-xl transition-all duration-200",
            dirty || saved || error
              ? "opacity-100"
              : "pointer-events-none h-0 overflow-hidden opacity-0"
          )}
        >
          <GlassCard variant="tinted">
            <GlassCardContent className="flex flex-wrap items-center justify-between gap-3 p-3 pl-4">
              <span className="flex items-center gap-2 text-[0.85rem]">
                {error ? (
                  <>
                    <span className="text-[color:var(--color-danger)]">
                      <AlertCircleIcon size={16} />
                    </span>
                    <span className="text-[color:var(--color-danger)]">
                      {error}
                    </span>
                  </>
                ) : saved && !dirty ? (
                  <>
                    <span className="text-[color:var(--color-success)]">
                      <CheckCircleIcon size={16} />
                    </span>
                    <span className="text-text-soft">{t("saved")}</span>
                  </>
                ) : (
                  <span className="text-text-soft">{t("unsaved")}</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={discard}
                  disabled={!dirty || pending}
                >
                  {t("discard")}
                </GlassButton>
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={save}
                  disabled={!dirty || pending}
                >
                  {pending ? t("saving") : t("save")}
                </GlassButton>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        <GlassCard variant="default">
          <GlassCardContent className="p-6">
            <header className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-xl text-text">
                  {t(`nav.${active}`)}
                </h2>
                <p className="mt-1 text-[0.85rem] text-text-soft">
                  {t(`sectionDescription.${active}`)}
                </p>
              </div>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => resetSection(active)}
                className="shrink-0"
              >
                {t("resetSection")}
              </GlassButton>
            </header>

            {active === "identity" && (
              <IdentitySection branding={branding} patch={patchBranding} />
            )}
            {active === "theme" && (
              <ThemeSection
                branding={branding}
                patch={patchBranding}
                mode={themeMode}
                onMode={setThemeMode}
              />
            )}
            {active === "hero" && (
              <HeroSeoSection branding={branding} patch={patchBranding} />
            )}
            {active === "access" && (
              <AccessSection settings={settings} patch={patchSettings} />
            )}
            {active === "media" && (
              <MediaSection settings={settings} patch={patchSettings} />
            )}
            {active === "ai" && (
              <AiSection
                settings={settings}
                patch={patchSettings}
                apiKey={apiKey}
                onApiKey={(v) => {
                  setSaved(false);
                  setApiKey(v);
                }}
              />
            )}
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
