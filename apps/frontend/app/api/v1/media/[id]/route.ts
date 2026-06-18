import { backendBaseUrl } from "@/lib/api";
import { logger } from "@/lib/logger";


export const runtime = "nodejs";

const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID_RE.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  let res: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000)
  try {
    res = await fetch(`${backendBaseUrl()}/api/v1/media/${id}`, {
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    logger.warn("mediaProxy", "backend unreachable");
    return new Response("Bad gateway", { status: 502 });
  } finally {
    clearTimeout(timeoutId);
  }
  if (!res.ok || !res.body) {
    if (res.status >= 500) logger.error("mediaProxy", "backend error", { status: res.status });
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  const contentType = res.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  headers.set(
    "cache-control",
    res.headers.get("cache-control") ?? "public, max-age=31536000, immutable"
  );

  const etag = res.headers.get("etag");
  if (etag) headers.set("etag", etag);
  
  headers.set("x-content-type-options", "nosniff");
  headers.set("content-disposition", "inline");
  
  return new Response(res.body, { status: 200, headers });
}
