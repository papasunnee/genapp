import { NextResponse } from "next/server";
import { PLATFORM_SESSION_COOKIE } from "@/lib/platformAuth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(PLATFORM_SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
