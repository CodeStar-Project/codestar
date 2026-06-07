import { backendBaseUrl } from "@/lib/api";

/**
 * Proxy course images from the backend so the browser can load them from the frontend origin
 */
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ID_RE.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  let res: Response;
  try {
    res = await fetch(`${backendBaseUrl()}/api/v1/media/${id}`, {
      cache: "no-store",
    });
  } catch {
    return new Response("Bad gateway", { status: 502 });
  }
  if (!res.ok || !res.body) {
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
