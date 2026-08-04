import { getControlConnection } from "./controlPlane";
import { getRateLimitAttemptModel } from "@/models/RateLimitAttempt";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Fixed-window rate limit keyed by an arbitrary string (typically
 * "purpose:ip" or "purpose:ip:email"). Records this call as an attempt
 * regardless of outcome - a caller retrying past the limit keeps
 * extending its own lockout window rather than getting free retries the
 * moment the oldest attempt ages out from under it.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  const controlConn = await getControlConnection();
  const RateLimitAttempt = getRateLimitAttemptModel(controlConn);
  const windowStart = new Date(Date.now() - windowMs);

  const recentCount = await RateLimitAttempt.countDocuments({
    key,
    createdAt: { $gte: windowStart },
  });

  if (recentCount >= maxAttempts) {
    const oldest = await RateLimitAttempt.findOne({ key, createdAt: { $gte: windowStart } }).sort({
      createdAt: 1,
    });
    const retryAfterMs = oldest
      ? oldest.createdAt.getTime() + windowMs - Date.now()
      : windowMs;
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  await RateLimitAttempt.create({ key });
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Best-effort client identifier from standard proxy headers (Vercel and
 * most reverse proxies set x-forwarded-for). Never perfect - a shared
 * NAT/office network sees this as one client - but combined with an
 * account-specific part of the key (e.g. email) where relevant, it's a
 * reasonable deterrent against scripted brute-forcing without requiring
 * new infrastructure.
 */
export function getClientIp(req: { headers: Headers }): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
