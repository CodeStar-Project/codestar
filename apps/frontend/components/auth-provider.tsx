"use client";

/**
 * Contexte d'authentification côté client.
 * Initial state injecté par le RootLayout (server) via `getMe()`.
 * Pour rafraîchir : appeler `router.refresh()` après une mutation auth
 * (les server actions le font déjà via `revalidatePath`).
 */

import * as React from "react";
import { useRouter } from "next/navigation";

import { signOutAction } from "@/app/actions/auth";
import type { MeResponse } from "@/lib/types";

interface AuthContextValue {
  user: MeResponse | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  initialUser: MeResponse | null;
  children: React.ReactNode;
}

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user: initialUser,
      isAuthenticated: initialUser !== null,
      signOut: async () => {
        await signOutAction();
        startTransition(() => router.refresh());
      },
    }),
    [initialUser, router]
  );

  // pending non exposé pour l'instant — disponible si besoin futur.
  void pending;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
