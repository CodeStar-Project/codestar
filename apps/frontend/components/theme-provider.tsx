"use client";

/**
 * Client theme context. Flips `document.documentElement.dataset.theme`
 * immediately for instant feedback, then persists the choice via the
 * `setThemeAction` server action. Initial value injected by RootLayout.
 */

import * as React from "react";

import { setThemeAction } from "@/app/actions/theme";
import { DEFAULT_THEME, type ResolvedTheme, type Theme } from "@/lib/theme";

interface ThemeContextValue {
  /** The stored preference (light | dark | system). */
  theme: Theme;
  /** The currently applied theme (system resolved to light|dark). */
  resolved: ResolvedTheme;
  setTheme: (next: Theme) => void;
  /** Convenience toggle between light and dark. */
  toggle: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function systemResolved(): ResolvedTheme {
  if (typeof window === "undefined") {
    return DEFAULT_THEME === "light" ? "light" : "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyResolved(theme: Theme): ResolvedTheme {
  const resolved: ResolvedTheme =
    theme === "system" ? systemResolved() : theme;
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = resolved;
  }
  return resolved;
}

export function ThemeProvider({
  initialTheme,
  initialResolved,
  children,
}: {
  initialTheme: Theme;
  initialResolved: ResolvedTheme;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = React.useState<Theme>(initialTheme);
  const [resolved, setResolved] =
    React.useState<ResolvedTheme>(initialResolved);

  // Keep `system` in sync with OS changes while the page is open.
  React.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(applyResolved("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    setResolved(applyResolved(next));
    void setThemeAction(next);
  }, []);

  const toggle = React.useCallback(() => {
    setTheme(
      (theme === "system" ? systemResolved() : theme) === "dark"
        ? "light"
        : "dark"
    );
  }, [theme, setTheme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolved, setTheme, toggle }),
    [theme, resolved, setTheme, toggle]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
