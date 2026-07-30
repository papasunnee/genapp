import { NextRequest, NextResponse } from "next/server";
import { verifyPlatformSecret, getPlatformSessionCookie } from "@/lib/platformAuth";

export async function POST(req: NextRequest) {
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
