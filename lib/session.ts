import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "session";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

/** Sign a session payload into a JWT. */
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey());
}

/**
 * Signed OAuth state (CSRF). Instead of storing a random value in a cookie
 * that must survive a cross-serverless redirect on Vercel, we sign a short-lived
 * token and verify its signature on callback — no cookie needed.
 */
export async function signOAuthState(): Promise<string> {
  return new SignJWT({ purpose: "oauth_state" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getSecretKey());
}

export async function verifyOAuthState(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload.purpose === "oauth_state";
  } catch {
    return false;
  }
}

/** Verify a JWT and return its payload, or null if invalid. */
export async function verifySession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string" &&
      typeof payload.name === "string"
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
      };
    }
    return null;
  } catch {
    return null;
  }
}
