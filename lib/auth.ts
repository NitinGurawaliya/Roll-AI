import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifySession,
  type SessionPayload,
} from "@/lib/session";

export {
  SESSION_COOKIE,
  signSession,
  verifySession,
  type SessionPayload,
} from "@/lib/session";

/** Write the session cookie (Route Handlers / Server Functions only). */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Clear the session cookie. */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Read and verify the current session from cookies (Server Components / Route Handlers). */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/**
 * Read and verify the session straight from a request's cookies. Use this in
 * Route Handlers — reading req.cookies is more reliable than next/headers
 * cookies() across runtimes.
 */
export async function getSessionFromRequest(req: {
  cookies: { get(name: string): { value: string } | undefined };
}): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/** Diagnostic: why did session verification fail? (debugging aid) */
export async function debugSession(token: string | undefined): Promise<string> {
  if (!process.env.AUTH_SECRET) return "no-auth-secret";
  if (!token) return "no-cookie";
  const session = await verifySession(token);
  return session ? "ok" : "invalid-or-expired";
}
