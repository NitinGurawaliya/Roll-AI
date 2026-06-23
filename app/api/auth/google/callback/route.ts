export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForProfile, getAppUrl } from "@/lib/google";
import { signSession, setSessionCookie } from "@/lib/auth";
import { resolveFurthestStep } from "@/lib/progress";

const STATE_COOKIE = "oauth_state";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const loginFailed = new URL("/login?error=auth", getAppUrl());

  if (error || !code || !state) {
    return NextResponse.redirect(loginFailed);
  }

  // Validate CSRF state against the cookie set when we redirected to Google.
  const cookieStore = await cookies();
  const savedState = cookieStore.get(STATE_COOKIE)?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(loginFailed);
  }
  cookieStore.delete(STATE_COOKIE);

  try {
    const profile = await exchangeCodeForProfile(code);

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
    await setSessionCookie(token);

    // Returning users resume at the furthest step they reached.
    const step = await resolveFurthestStep(user.id);
    return NextResponse.redirect(new URL(step, getAppUrl()));
  } catch (e) {
    console.error("OAuth callback error:", e);
    return NextResponse.redirect(loginFailed);
  }
}
