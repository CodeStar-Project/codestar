"use client";

/**
 * Expose le branding de l'instance aux client components.
 * Initial value injectée par le RootLayout (server) via `getInstanceBranding()`.
 */

import * as React from "react";

import type { InstanceBranding } from "@/lib/types";

const BrandingContext = React.createContext<InstanceBranding | null>(null);

export function BrandingProvider({
  branding,
  children,
}: {
  branding: InstanceBranding;
  children: React.ReactNode;
}) {
  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useInstanceBranding(): InstanceBranding {
  const ctx = React.useContext(BrandingContext);
  if (!ctx)
    throw new Error(
      "useInstanceBranding must be used within <BrandingProvider>"
    );
  return ctx;
}
