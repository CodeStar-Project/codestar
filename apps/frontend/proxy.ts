import { NextResponse, type NextRequest } from "next/server";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable : ${name}`);
  }
  return value;
}

let _authCookieName: string | undefined;
function authCookieName(): string {
  return (_authCookieName ??= requireEnv("AUTH_COOKIE_NAME"));
}

const PUBLIC_PREFIXES = ["/login"];
const PUBLIC_EXACT = new Set(["/"]);

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = (4 - (b64.length % 4)) % 4;
    const bin = atob(b64 + "=".repeat(pad));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

function isOnLogin(pathname: string): boolean {
  return pathname === "/login" || pathname.startsWith("/login/");
}

function clearAuthCookie<T extends NextResponse>(res: T): T {
  res.cookies.delete({ name: authCookieName(), path: "/" });
  return res;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const tokenValue = req.cookies.get(authCookieName())?.value;

  let hasValidToken = false;
  let tokenExpired = false;
  if (tokenValue) {
    const payload = decodeJwtPayload(tokenValue);
    if (payload?.exp && payload.exp * 1000 > Date.now()) {
      hasValidToken = true;
    } else {
      tokenExpired = true;
    }
  }

  if (hasValidToken && isOnLogin(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!hasValidToken && !isPublic(pathname)) {
    const url = new URL("/login", req.url);
    if (tokenExpired) url.searchParams.set("expired", "1");
    url.searchParams.set("next", pathname + req.nextUrl.search);
    const res = NextResponse.redirect(url);
    return tokenExpired ? clearAuthCookie(res) : res;
  }

  if (tokenExpired) {
    if (
      isOnLogin(pathname) &&
      req.nextUrl.searchParams.get("expired") !== "1"
    ) {
      const url = req.nextUrl.clone();
      url.searchParams.set("expired", "1");
      return clearAuthCookie(NextResponse.redirect(url));
    }
    return clearAuthCookie(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)",
  ],
};
