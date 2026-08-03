import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  // This app is served on many subdomains (one per tenant), not one fixed
  // host - without this, Auth.js only trusts the single origin it was
  // configured with (AUTH_URL/NEXTAUTH_URL) and can silently redirect
  // sign-in/sign-out callbacks there instead of back to the subdomain the
  // request actually came from.
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,
  },
  providers: [],
  callbacks: {
    // Auth.js's default redirect callback only allows a callback URL whose
    // origin exactly matches `baseUrl` (derived from AUTH_URL/NEXTAUTH_URL
    // when that's set) - anything else silently falls back to baseUrl.
    // That's wrong for a multi-tenant app: every subdomain is a legitimate
    // redirect target (sign-in/sign-out on acmelabs.thelabsuite.com should
    // land back on acmelabs.thelabsuite.com, not thelabsuite.com just
    // because that's the one fixed origin Auth.js was configured with).
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      try {
        const targetHost = new URL(url).hostname.toLowerCase();
        const rootDomain = (process.env.ROOT_DOMAIN || "").toLowerCase();
        if (
          rootDomain &&
          (targetHost === rootDomain || targetHost.endsWith(`.${rootDomain}`))
        ) {
          return url;
        }
      } catch {
        // Malformed URL - fall through to the safe default below.
      }

      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.firstname = (user as any).firstname;
        token._id = (user as any)._id?.toString();
        token.lastname = (user as any).lastname;
        token.role = (user as any).role;
        token.organizationId = (user as any).organizationId;
        token.organizationSubdomain = (user as any).organizationSubdomain;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = { ...token } as any;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
