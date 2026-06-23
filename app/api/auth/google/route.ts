export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl, getOrigin } from "@/lib/google";

const STATE_COOKIE = "oauth_state";

export async function GET(req: NextRequest) {
  // Random CSRF state — bound to a short-lived cookie and echoed back by Google.
  const state = crypto.randomUUID();

  // Derive redirect_uri from the actual request origin so it matches in any
  // environment (localhost, preview, production).
  const origin = getOrigin(req);

  // Set the state cookie DIRECTLY on the redirect response. next/headers
  // cookies() does not reliably attach Set-Cookie to a self-constructed
  // redirect on Vercel, which would break the CSRF check on callback.
  const response = NextResponse.redirect(getGoogleAuthUrl(origin, state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });
  return response;
}
