export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Temporary diagnostic endpoint. Visit it directly in the browser AFTER
// logging in: https://<your-app>/api/whoami
export async function GET(req: NextRequest) {
  const rawCookieHeader = req.headers.get("cookie") ?? "";
  const cookieNames = req.cookies.getAll().map((c) => c.name);
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  return NextResponse.json({
    hasAuthSecret: !!process.env.AUTH_SECRET,
    nodeEnv: process.env.NODE_ENV,
    host: req.headers.get("host"),
    forwardedHost: req.headers.get("x-forwarded-host"),
    forwardedProto: req.headers.get("x-forwarded-proto"),
    cookieHeaderPresent: rawCookieHeader.length > 0,
    cookieNames,
    hasSessionCookie: !!token,
    sessionValid: !!session,
  });
}
