import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

// Routes that require an authenticated session.
const PROTECTED_PREFIXES = [
  "/upload",
  "/insight",
  "/discovery",
  "/recommendations",
  "/path",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  // Gate protected app routes.
  if (isProtected(pathname) && !session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Already signed in — skip the login page.
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/upload", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/upload/:path*",
    "/insight/:path*",
    "/discovery/:path*",
    "/recommendations/:path*",
    "/path/:path*",
    "/login",
  ],
};
