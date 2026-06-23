/** Google OAuth helpers (server-side). */

/**
 * Resolve the public origin of the current request.
 *
 * Behind Vercel/proxies the request URL host is internal, so we prefer the
 * `x-forwarded-*` headers (and `host`). Falls back to the request URL, then to
 * APP_URL. This is what keeps the OAuth redirect_uri matching on any domain.
 */
export function getOrigin(req: Request): string {
  const h = req.headers;
  const forwardedHost = h.get("x-forwarded-host") ?? h.get("host");
  const forwardedProto =
    h.get("x-forwarded-proto") ??
    (forwardedHost?.startsWith("localhost") ? "http" : "https");

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  try {
    return new URL(req.url).origin;
  } catch {
    return process.env.APP_URL || "http://localhost:3000";
  }
}

export function getRedirectUri(origin: string): string {
  return `${origin}/api/auth/google/callback`;
}

export function getGoogleAuthUrl(origin: string, state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not set");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
}

/** Exchange an authorization code for the user's Google profile. */
export async function exchangeCodeForProfile(
  code: string,
  origin: string
): Promise<GoogleProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${detail}`);
  }

  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) {
    throw new Error("No access_token returned from Google");
  }

  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }
  );

  if (!profileRes.ok) {
    const detail = await profileRes.text();
    throw new Error(`Google userinfo failed: ${detail}`);
  }

  const profile = (await profileRes.json()) as {
    id: string;
    email: string;
    name?: string;
  };

  return {
    sub: profile.id,
    email: profile.email,
    name: profile.name || profile.email.split("@")[0],
  };
}
