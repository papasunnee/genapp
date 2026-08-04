import { NextRequest, NextResponse } from "next/server";
import { verifyPlatformSecret, getPlatformSessionCookie } from "@/lib/platformAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // This is a single shared secret, not a per-account password - the only
  // defense against someone scripting guesses against it is throttling.
  const rateLimit = await checkRateLimit(`platform-login:${getClientIp(req)}`, 10, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: `Too many attempts. Try again in ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minute(s).` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));

  if (!verifyPlatformSecret(body.secret)) {
    return NextResponse.json(
      { success: false, error: "Invalid platform secret" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ success: true });
  const cookie = getPlatformSessionCookie();
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
