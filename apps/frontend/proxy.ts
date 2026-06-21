import { NextResponse, type NextRequest } from "next/server";
import { errors as joseErrors, jwtVerify } from "jose";

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

let _jwtSecretKey: Uint8Array | undefined;
function jwtSecretKey(): Uint8Array {
  return (_jwtSecretKey ??= new TextEncoder().encode(requireEnv("JWT_SECRET")));
}

/**
 * Verifies the JWT signature against the shared backend secret and rejects disallowed algorithms 
 */
async function verifyToken(token: string): Promise<"valid" | "expired" | "invalid"> {
  const key = jwtSecretKey();
  try {
    await jwtVerify(token, key, {
      algorithms: ["HS256", "HS384", "HS512"],
    });
    return "valid";
  } catch (e) {
    if (e instanceof joseErrors.JWTExpired) return "expired";
    return "invalid";
  }
}

const PUBLIC_PREFIXES = ["/login"];
const PUBLIC_EXACT = new Set(["/"]);

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isOnLogin(pathname: string): boolean {
  return pathname === "/login" || pathname.startsWith("/login/");
}

function clearAuthCookie<T extends NextResponse>(res: T): T {
  res.cookies.delete({ name: authCookieName(), path: "/" });
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const tokenValue = req.cookies.get(authCookieName())?.value;

  let hasValidToken = false;
  let tokenExpired = false;
  let tokenInvalid = false;
  if (tokenValue) {
    const status = await verifyToken(tokenValue);
    if (status === "valid") hasValidToken = true;
    else if (status === "expired") tokenExpired = true;
    else tokenInvalid = true;
  }

  if (hasValidToken && isOnLogin(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!hasValidToken && !isPublic(pathname)) {
    const url = new URL("/login", req.url);
    if (tokenExpired) url.searchParams.set("expired", "1");
    url.searchParams.set("next", pathname + req.nextUrl.search);
    const res = NextResponse.redirect(url);
    return tokenExpired || tokenInvalid ? clearAuthCookie(res) : res;
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
