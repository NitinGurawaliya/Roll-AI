export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForProfile, getOrigin } from "@/lib/google";
import { signSession, SESSION_COOKIE } from "@/lib/auth";
import { SESSION_MAX_AGE } from "@/lib/session";
import { resolveFurthestStep } from "@/lib/progress";

const STATE_COOKIE = "oauth_state";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const origin = getOrigin(req);
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, origin));

  if (error) return fail(`google_${error}`);
  if (!code || !state) return fail("missing_params");

  // Validate CSRF state against the cookie set when we redirected to Google.
  // Read straight from the request cookies for reliability on Vercel.
  const savedState = req.cookies.get(STATE_COOKIE)?.value;
  if (!savedState) return fail("no_state_cookie");
  if (savedState !== state) return fail("state_mismatch");

  try {
    const profile = await exchangeCodeForProfile(code, origin);

    // Upsert the user — create on first login, otherwise load existing.
    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: { name: profile.name },
      create: { email: profile.email, name: profile.name },
    });

    const token = await signSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // Returning users resume at the furthest step they reached.
    const step = await resolveFurthestStep(user.id);

    // Set the session cookie DIRECTLY on the redirect response. Setting it via
    // next/headers cookies() does not reliably attach Set-Cookie to a
    // self-constructed redirect on Vercel — which silently drops the session.
    const response = NextResponse.redirect(new URL(step, origin));
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    // Clear the one-time CSRF state cookie on the same response.
    response.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  } catch (e) {
    console.error("OAuth callback error:", e);
    const msg = e instanceof Error ? e.message : "unknown";
    return fail(`exchange_${encodeURIComponent(msg.slice(0, 80))}`);
  }
}
