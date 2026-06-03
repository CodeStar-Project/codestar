import "server-only";

/**
 * Fetch instance branding
*/

import { apiFetch } from "@/lib/api";
import { DEFAULT_INSTANCE } from "@/lib/instance";
import type { InstanceBranding } from "@/lib/types";

// TODO replace to settings
export async function getInstanceBranding(): Promise<InstanceBranding> {
  try {
    const data = await apiFetch<InstanceBranding>("/api/v1/instance/branding", {
      method: "GET",
      withAuth: false,
      next: { revalidate: 60 },
    });
    return data ?? DEFAULT_INSTANCE;
  } catch {
    // Frontend static fallback
    return DEFAULT_INSTANCE;
  }
}
