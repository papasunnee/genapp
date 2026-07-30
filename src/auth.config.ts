import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
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
