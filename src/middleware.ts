import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// Server Components/layouts have no built-in way to read the current
// pathname - admin/layout.tsx needs it to know whether a Free-trial-expired
// org is already on the billing page (allowed) or anywhere else (blocked),
// so middleware (which does see the real request URL) forwards it via a
// header rather than adding a second routing mechanism.
export default auth((req) => {
  const res = NextResponse.next();
  res.headers.set("x-pathname", req.nextUrl.pathname);
  return res;
});

export const config = {
  matcher: ["/admin/:path*"],
};
