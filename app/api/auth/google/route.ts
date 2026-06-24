export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl, getOrigin } from "@/lib/google";
import { signOAuthState } from "@/lib/session";

export async function GET(req: NextRequest) {
  // CSRF state as a SIGNED, short-lived token carried in the `state` param that
  // Google echoes back. We deliberately do NOT use a cookie here: a Set-Cookie
  // on a self-constructed redirect does not reliably survive the cross-site
  // round-trip to Google on Vercel, which silently broke the callback's CSRF
  // check and bounced every login back to /login.
  const state = await signOAuthState();

  // Derive redirect_uri from the actual request origin so it matches in any
  // environment (localhost, preview, production).
  const origin = getOrigin(req);

  return NextResponse.redirect(getGoogleAuthUrl(origin, state));
}
