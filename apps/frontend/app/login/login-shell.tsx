"use client";

/**
 * Shell client de la page /login.
 * Layout split 50/50 desktop, stack 100% mobile.
 * Tabs glass pour basculer signin / signup / join.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  joinGroupAction,
  signInAction,
  signUpAction,
} from "@/app/actions/auth";
import { BrandMark, type LogoPreset } from "@/components/brand-mark";
import { useInstanceBranding } from "@/components/branding-provider";
import { AuroraLayer } from "@/components/home/aurora-layer";
import { GlassChip } from "@/components/ui/glass-chip";
import { GlassField, GlassInput } from "@/components/ui/glass-input";
import { CheckIcon } from "@/components/ui/icons";
import { SlideToConfirm } from "@/components/ui/slide-to-confirm";

type LoginMode = "signin" | "signup" | "join";

interface LoginShellProps {
  initialMode: LoginMode;
  initialCode?: string;
  sessionExpired?: boolean;
  nextPath?: string;
}

export function LoginShell({
  initialMode,
  initialCode,
  sessionExpired = false,
  nextPath = "/",
}: LoginShellProps) {
  const t = useTranslations("login");
  const tSwitch = useTranslations("login.switch");
  const tNav = useTranslations("nav");
  const branding = useInstanceBranding();
  const [mode, setMode] = React.useState<LoginMode>(initialMode);

  const headline =
    mode === "signin" ? (
      <>{t("headlines.signin")}</>
    ) : mode === "signup" ? (
      <>
        {t("headlines.signupPrefix")} {t("headlines.signupSuffix")}
      </>
    ) : (
      <>
        {t("headlines.joinPrefix")}{" "}
        <span className="italic text-[color:var(--color-accent)]">
          {t("headlines.joinHighlight")}
        </span>
        {t("headlines.joinSuffix")}
      </>
    );

  const tagline = t(
    mode === "signin"
      ? "taglines.signin"
      : mode === "signup"
        ? "taglines.signup"
        : "taglines.join"
  );

  return (
    <main className="grid h-[100dvh] grid-cols-1 overflow-hidden lg:grid-cols-[1.05fr_1fr]">
      <section className="flex items-center justify-center overflow-y-auto px-6 py-12 lg:px-10">
        <div className="fx-rise w-full max-w-[440px]">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2.5"
            aria-label={tNav("homeAria", { name: branding.name })}
          >
            <BrandMark size={36} />
            <span className="font-semibold text-text">
              {branding.name}
            </span>
          </Link>

          <ModeTabs mode={mode} onChange={setMode} />

          <h1 className="font-display text-[clamp(2.4rem,5vw,3rem)] leading-[1.05] tracking-tight text-text">
            {headline}
          </h1>
          <p className="mt-2 text-[0.95rem] text-text-soft">{tagline}</p>

          {sessionExpired && (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-[var(--r)] border border-[color:color-mix(in_oklab,var(--color-warning)_45%,transparent)] bg-[color:color-mix(in_oklab,var(--color-warning)_15%,transparent)] px-4 py-3 text-[0.88rem] text-text"
            >
              {t("expiredBanner")}
            </div>
          )}

          <LoginForm
            mode={mode}
            initialCode={initialCode}
            nextPath={nextPath}
          />

          <p className="mt-8 text-center text-[0.88rem] text-text-soft">
            {mode === "signin" ? (
              <>
                {tSwitch("noAccount")}{" "}
                <button
                  type="button"
                  className="font-medium text-[color:var(--color-accent)] hover:underline"
                  onClick={() => setMode("signup")}
                >
                  {tSwitch("createAccount")}
                </button>
              </>
            ) : mode === "signup" ? (
              <>
                {tSwitch("alreadyRegistered")}{" "}
                <button
                  type="button"
                  className="font-medium text-[color:var(--color-accent)] hover:underline"
                  onClick={() => setMode("signin")}
                >
                  {tSwitch("signin")}
                </button>
              </>
            ) : (
              <>
                {tSwitch("noCode")}{" "}
                <button
                  type="button"
                  className="font-medium text-[color:var(--color-accent)] hover:underline"
                  onClick={() => setMode("signin")}
                >
                  {tSwitch("signin")}
                </button>
              </>
            )}
          </p>
        </div>
      </section>

      <DecorativeAside />
    </main>
  );
}

/* ============================================================
   Mode tabs
   ============================================================ */

function ModeTabs({
  mode,
  onChange,
}: {
  mode: LoginMode;
  onChange: (m: LoginMode) => void;
}) {
  const t = useTranslations("login.modes");
  const tAria = useTranslations("login");
  const modes: LoginMode[] = ["signin", "signup", "join"];
  return (
    <div
      role="tablist"
      aria-label={tAria("modeAria")}
      className="mb-8 inline-flex rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] p-1 backdrop-blur-md"
    >
      {modes.map((m) => {
        const active = m === mode;
        return (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(m)}
            className={
              "rounded-full px-3.5 py-1.5 text-[0.82rem] font-medium transition-colors " +
              (active
                ? "bg-[color:var(--glass-bg-strong)] text-text shadow-[0_2px_8px_rgba(31,38,135,0.06)]"
                : "text-text-soft hover:text-text")
            }
          >
            {t(m)}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   Form
   ============================================================ */

interface FormState {
  email: string;
  password: string;
  code: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  code?: string;
  submit?: string;
}

const CODE_RE = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

function LoginForm({
  mode,
  initialCode,
  nextPath,
}: {
  mode: LoginMode;
  initialCode?: string;
  nextPath: string;
}) {
  const tFields = useTranslations("login.fields");
  const tErrors = useTranslations("login.errors");
  const tCtas = useTranslations("login.ctas");
  const tSlide = useTranslations("login.slide");
  const tConsent = useTranslations("login.consent");
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);

  const [state, setState] = React.useState<FormState>({
    email: "",
    password: "",
    code: initialCode ?? "",
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  const requireCode = mode === "join";
  const showCode = mode === "join" || mode === "signup";

  // Validité live par champ — alimente la coche « pop » de validation.
  // Uniquement quand un critère de format réel existe (on ne « valide »
  // jamais un mot de passe en signin, on ne le connaît pas).
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
  const passwordValid = mode === "signup" && state.password.length >= 8;
  const codeValid = CODE_RE.test(state.code.trim().toUpperCase());

  const validate = (s: FormState): FormErrors => {
    const e: FormErrors = {};
    if (!s.email) e.email = tErrors("emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email))
      e.email = tErrors("emailInvalid");

    if (!s.password) e.password = tErrors("passwordRequired");
    else if (mode === "signup" && s.password.length < 8)
      e.password = tErrors("passwordTooShort");

    const trimmedCode = s.code.trim();
    if (requireCode && !trimmedCode) {
      e.code = tErrors("codeRequired");
    } else if (trimmedCode && !CODE_RE.test(trimmedCode.toUpperCase())) {
      e.code = tErrors("codeInvalid");
    }
    return e;
  };

  const onSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const v = validate(state);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    setErrors({});

    try {
      let result: { ok: boolean; error?: string; expired?: boolean };

      if (mode === "signin") {
        result = await signInAction({
          email: state.email,
          password: state.password,
        });
      } else if (mode === "signup") {
        const trimmedCode = state.code.trim().toUpperCase();
        result = await signUpAction({
          email: state.email,
          password: state.password,
          // TODO
          // V1 — pas de champ displayName dans le form. Fallback : partie locale
          // de l'email. À remplacer par un input dédié ou une étape post-signup.
          displayName: state.email.split("@")[0] || state.email,
          invitationCode: trimmedCode || undefined,
        });
      } else {
        // join : signin existant puis join du groupe via le code.
        result = await signInAction({
          email: state.email,
          password: state.password,
        });
        if (result.ok) {
          result = await joinGroupAction({ code: state.code.toUpperCase() });
        }
      }

      if (result.ok) {
        // Default landing ("/") → role dispatcher. A real deep-link is honored.
        router.push(nextPath === "/" ? "/dashboard" : nextPath);
        // Force le re-fetch du RootLayout (auth + branding) pour que la nav
        // bascule immédiatement en état authentifié.
        router.refresh();
      } else if (result.expired) {
        window.location.href = "/login?expired=1";
      } else {
        setErrors({ submit: result.error ?? tErrors("unknown") });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      className="mt-8 space-y-4"
      onSubmit={onSubmit}
      noValidate
    >
      <GlassField
        label={tFields("email")}
        htmlFor="email"
        required
        error={errors.email}
      >
        <div className="relative">
          <GlassInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            aria-invalid={!!errors.email}
            value={state.email}
            onChange={(e) =>
              setState((s) => ({ ...s, email: e.target.value }))
            }
            className="pr-11"
          />
          <ValidCheck show={emailValid} />
        </div>
      </GlassField>

      <GlassField
        label={
          <span className="flex items-center justify-between">
            <span>{tFields("password")}</span>
            {mode === "signin" && (
              <span className="text-[0.78rem] text-muted">
                {tFields("passwordRecoverySoon")}
              </span>
            )}
          </span>
        }
        htmlFor="password"
        required
        helper={mode === "signup" ? tFields("passwordHelper") : undefined}
        error={errors.password}
      >
        <div className="relative">
          <GlassInput
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            required
            aria-invalid={!!errors.password}
            value={state.password}
            onChange={(e) =>
              setState((s) => ({ ...s, password: e.target.value }))
            }
            className="pr-11"
          />
          <ValidCheck show={passwordValid} />
        </div>
      </GlassField>

      {showCode && (
        <GlassField
          label={tFields("code")}
          htmlFor="code"
          required={requireCode}
          helper={
            requireCode
              ? tFields("codeHelper")
              : tFields("codeHelperOptional")
          }
          error={errors.code}
        >
          <div className="relative">
            <GlassInput
              id="code"
              name="code"
              type="text"
              inputMode="text"
              autoComplete="one-time-code"
              required={requireCode}
              placeholder={tFields("codePlaceholder")}
              aria-invalid={!!errors.code}
              value={state.code}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  code: e.target.value.toUpperCase(),
                }))
              }
              className="pr-11 font-mono tracking-widest uppercase"
            />
            <ValidCheck show={codeValid} />
          </div>
        </GlassField>
      )}

      {errors.submit && (
        <div
          role="alert"
          className="rounded-[var(--r)] border border-[color:color-mix(in_oklab,var(--color-warning)_45%,transparent)] bg-[color:color-mix(in_oklab,var(--color-warning)_15%,transparent)] px-4 py-3 text-[0.85rem] text-text"
        >
          {errors.submit}
        </div>
      )}

      {/* Validation par glissement — geste volontaire plutôt qu'un clic.
          Le bouton submit caché préserve l'envoi via la touche Entrée. */}
      <SlideToConfirm
        onConfirm={() => formRef.current?.requestSubmit()}
        label={tSlide("label")}
        confirmedLabel={tSlide("confirmed")}
        ariaLabel={tCtas(mode)}
        loading={submitting}
      />
      <button type="submit" className="sr-only" tabIndex={-1} aria-hidden>
        {tCtas(mode)}
      </button>

      <p className="text-center text-[0.78rem] text-muted">
        {tConsent("prefix")}{" "}
        <a href="#" className="underline hover:text-text-soft">
          {tConsent("terms")}
        </a>{" "}
        {tConsent("and")}{" "}
        <a href="#" className="underline hover:text-text-soft">
          {tConsent("privacy")}
        </a>
        .
      </p>
    </form>
  );
}

/* ============================================================
   Coche de validation live — surgit en « pop » élastique dès
   qu'un champ devient valide. Purement décoratif (a11y : la
   validation réelle reste portée par aria-invalid + erreurs).
   ============================================================ */

function ValidCheck({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[color:var(--color-success)]"
    >
      <CheckIcon size={18} className="fx-pop" strokeWidth={2.4} />
    </span>
  );
}

/* ============================================================
   Panneau de marque (droite) — sobre. Aucune donnée inventée :
   la phrase de l'instance (tagline) + des faits réels uniquement.
   ============================================================ */

function DecorativeAside() {
  const branding = useInstanceBranding();
  const t = useTranslations("login.aside");
  const preset = branding.logo.value as LogoPreset;

  const facts = [
    t("facts.openSource"),
    t("facts.license"),
    t("facts.selfHosted"),
  ];

  return (
    <aside
      className="relative hidden overflow-hidden border-l border-[color:var(--glass-border)] lg:block"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(140deg, color-mix(in oklab, var(--color-accent) 22%, var(--color-bg-base)), color-mix(in oklab, var(--color-accent) 8%, var(--color-bg-base)))`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, color-mix(in oklab, var(--color-accent) 35%, transparent), transparent 50%), radial-gradient(circle at 80% 80%, color-mix(in oklab, var(--color-accent) 25%, transparent), transparent 55%)",
        }}
      />

      {/* Décor animé : aurora + orbes + particules. */}
      <AuroraLayer />

      <div className="relative flex h-full flex-col justify-between p-12">
        <div
          className="fx-rise flex items-center gap-2.5"
          style={{ animationDelay: "0.1s" }}
        >
          <BrandMark size={34} preset={preset} accent={branding.accent} />
          <span className="text-[1.05rem] font-semibold text-text">
            {branding.name}
          </span>
        </div>

        <div>
          <h2
            className="fx-rise max-w-md font-display text-[clamp(2.4rem,3.4vw,3.4rem)] leading-[1.04] text-text"
            style={{ animationDelay: "0.2s" }}
          >
            {branding.tagline}
          </h2>
          <p
            className="fx-rise mt-5 max-w-sm text-[1.02rem] leading-relaxed text-text-soft"
            style={{ animationDelay: "0.35s" }}
          >
            {t("subline")}
          </p>
        </div>

        <ul className="flex flex-wrap items-center gap-2">
          {facts.map((fact, i) => (
            <li
              key={fact}
              className="fx-rise"
              style={{ animationDelay: `${0.5 + i * 0.1}s` }}
            >
              <GlassChip variant="default" size="sm" className="fx-sheen">
                {fact}
              </GlassChip>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
