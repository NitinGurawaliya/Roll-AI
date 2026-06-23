export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { getAppUrl } from "@/lib/google";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", getAppUrl()));
}
