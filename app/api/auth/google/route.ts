export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getGoogleAuthUrl } from "@/lib/google";

const STATE_COOKIE = "oauth_state";

export async function GET() {
  // Random CSRF state — bound to a short-lived cookie and echoed back by Google.
  const state = crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  return NextResponse.redirect(getGoogleAuthUrl(state));
}
