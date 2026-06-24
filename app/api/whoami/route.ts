export const runtime = "nodejs";
// Never cache this — it must run per request and reflect incoming cookies.
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Temporary diagnostic endpoint. Visit it directly in the browser, then
// RELOAD it once. The second load should show "cookietest" in cookieNames —
// that proves plain cookie round-trip works on this deployment.
export async function GET(req: NextRequest) {
  const rawCookieHeader = req.headers.get("cookie") ?? "";
  const cookieNames = req.cookies.getAll().map((c) => c.name);
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  const res = NextResponse.json({
    hasAuthSecret: !!process.env.AUTH_SECRET,
    nodeEnv: process.env.NODE_ENV,
    host: req.headers.get("host"),
    forwardedHost: req.headers.get("x-forwarded-host"),
    forwardedProto: req.headers.get("x-forwarded-proto"),
    cookieHeaderPresent: rawCookieHeader.length > 0,
    cookieNames,
    sawCookietest: cookieNames.includes("cookietest"),
    hasSessionCookie: !!token,
    sessionValid: !!session,
  });

  // Set a plain, visible test cookie (no httpOnly) on this normal response.
  res.cookies.set("cookietest", "1", {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
