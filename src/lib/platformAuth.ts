import crypto from "crypto";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export const PLATFORM_SESSION_COOKIE = "platform_session";

/**
 * Stateless session token: an HMAC of a fixed string keyed by
 * PLATFORM_ADMIN_SECRET. Anyone who knows the secret can reproduce it (so
 * login just re-derives it), but the raw secret itself never sits in a
 * cookie, and it can't be forged without knowing the secret.
 */
function derivedSessionToken(): string {
  const secret = process.env.PLATFORM_ADMIN_SECRET;
  if (!secret) {
    throw new Error("PLATFORM_ADMIN_SECRET is not configured");
  }
  return crypto.createHmac("sha256", secret).update("platform-admin-session").digest("hex");
}

export function verifyPlatformSecret(secret: unknown): boolean {
  if (!process.env.PLATFORM_ADMIN_SECRET || typeof secret !== "string") {
    return false;
  }
  return secret === process.env.PLATFORM_ADMIN_SECRET;
}

export function getPlatformSessionCookie() {
  return {
    name: PLATFORM_SESSION_COOKIE,
    value: derivedSessionToken(),
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 12,
      path: "/",
    },
  };
}

/** For Route Handlers - reads the cookie straight off the NextRequest. */
export function hasPlatformSessionFromRequest(req: NextRequest): boolean {
  if (!process.env.PLATFORM_ADMIN_SECRET) return false;
  const token = req.cookies.get(PLATFORM_SESSION_COOKIE)?.value;
  return !!token && token === derivedSessionToken();
}

/** For Server Components/layouts - reads the cookie via next/headers. */
export async function hasPlatformSession(): Promise<boolean> {
  if (!process.env.PLATFORM_ADMIN_SECRET) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(PLATFORM_SESSION_COOKIE)?.value;
  return !!token && token === derivedSessionToken();
}

/**
 * Route Handlers protecting platform-level resources accept either the
 * legacy x-platform-secret header (used by the original organization
 * creation script/CLI callers) or the browser session cookie set by the
 * platform login page.
 */
export function isAuthorizedPlatformRequest(req: NextRequest): boolean {
  const headerSecret = req.headers.get("x-platform-secret");
  if (verifyPlatformSecret(headerSecret)) return true;
  return hasPlatformSessionFromRequest(req);
}
