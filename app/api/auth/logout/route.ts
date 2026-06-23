export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { getOrigin } from "@/lib/google";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", getOrigin(req)));
}
