"use server";

import { ApiError, apiUpload } from "@/lib/api";
import type { MediaUpload } from "@/lib/types";

export async function uploadMedia(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const data = await apiUpload<MediaUpload>("/api/v1/media", formData);
    return { ok: true, url: data?.url };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, error: e.message };
    if (e instanceof Error) return { ok: false, error: e.message };
    return { ok: false, error: undefined };
  }
}
