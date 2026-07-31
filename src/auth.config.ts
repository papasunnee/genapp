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
