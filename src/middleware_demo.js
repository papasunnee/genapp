// import { NextResponse } from "next/server";

// export function middleware(req) {
//   const sessionCookie = req.cookie.get("session");
//   req.cookies.set("new_cookie", "my_new_cookie");
//   if (req.nextUrl.pathname.startsWith("/admin")) {
//     if (!sessionCookie) {
//       console.log("Go to hell");
//       return NextResponse.rewrite("/admin");
//     }
//   }
// }

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
export default withAuth(
  function middleware() {
    return NextResponse.rewrite(new URL("/admin", req.url));
  },
  {
    callbacks: {
      authorized({ token }) {
        return token?.role == "admin";
      },
    },
  }
);

export const config = { matcher: ["/", "/admin"] };
