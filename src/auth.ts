import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Access from "@/models/Access";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      credentials: {},
      async authorize(credentials) {
        await dbConnect();

        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        const user = await User.findOne({ email }).populate("role");
        if (!user) {
          throw new Error("Invalid Login Credentials");
        }

        const access = await Access.findOne({ user: user._id });
        if (!access) {
          throw new Error("Invalid Login Credentials");
        }

        const passwordCompare = await access.comparePassword(password);
        if (!passwordCompare) {
          throw new Error("Invalid Login Credentials");
        }

        return user as any;
      },
    }),
  ],
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
});
