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
import { BrandMark } from "@/components/brand-mark";
import { useInstanceBranding } from "@/components/branding-provider";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassChip } from "@/components/ui/glass-chip";
import { GlassField, GlassInput } from "@/components/ui/glass-input";
import { ArrowRightIcon, KeyIcon, StarIcon } from "@/components/ui/icons";

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
    <main className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      <section className="flex items-center justify-center px-6 py-16 lg:px-10">
        <div className="w-full max-w-[440px]">
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
  const tConsent = useTranslations("login.consent");
  const router = useRouter();

  const [state, setState] = React.useState<FormState>({
    email: "",
    password: "",
    code: initialCode ?? "",
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  const requireCode = mode === "join";
  const showCode = mode === "join" || mode === "signup";

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
        router.push(nextPath);
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
    <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
      <GlassField
        label={tFields("email")}
        htmlFor="email"
        required
        error={errors.email}
      >
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
        />
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
        />
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
            className="font-mono tracking-widest uppercase"
          />
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

      <GlassButton
        type="submit"
        variant="primary"
        size="lg"
        loading={submitting}
        className="w-full"
      >
        {!submitting && (
          <>
            {tCtas(mode)}
            <ArrowRightIcon size={14} />
          </>
        )}
      </GlassButton>

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
   Decorative right panel
   ============================================================ */

function DecorativeAside() {
  const branding = useInstanceBranding();
  const t = useTranslations("login.decorative");

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
      <div className="relative flex h-full flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <GlassChip variant="default" size="sm">
            <StarIcon size={12} />
            {t("license")}
          </GlassChip>
          <GlassChip variant="default" size="sm">
            {t("selfHosted")}
          </GlassChip>
        </div>

        <div>
          <h2 className="font-display text-[clamp(2.5rem,3.4vw,3.4rem)] leading-[1.05] text-text">
            <em className="italic">
              {t("quote", { name: branding.name })}
            </em>
          </h2>
          <div className="mt-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-[0.85rem] font-semibold text-white"
              style={{ background: "var(--color-accent)" }}
              aria-hidden
            >
              NM
            </div>
            <div>
              <div className="text-[0.92rem] font-semibold text-text">
                {t("quoteAuthor")}
              </div>
              <div className="text-[0.8rem] text-muted">{t("quoteRole")}</div>
            </div>
          </div>
        </div>

        <div className="glass-strong w-fit max-w-[340px] rounded-[var(--r-lg)] p-4">
          <div className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">
            <KeyIcon size={13} style={{ color: "var(--color-accent)" }} />
            {t("streakLabel")}
          </div>
          <div className="font-display text-[2.2rem] leading-tight text-text">
            {t("streakValue")}
          </div>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="h-4 flex-1 rounded-sm"
                style={{
                  background:
                    i >= 11
                      ? "var(--color-accent)"
                      : "color-mix(in oklab, var(--color-accent) 25%, var(--color-bg-base))",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
