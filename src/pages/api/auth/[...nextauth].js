import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import TestCategory from "@/models/TestCategory";
import TestType from "@/models/TestType";
import TestParameter from "@/models/TestParameter";
import Access from "@/models/Access";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {},
      async authorize(credentials, req) {
        try {
          await dbConnect();
        } catch (error) {
          throw new Error(error.message);
        }
        const { email, password } = credentials;
        const user = await User.findOne({ email }).populate("role");
        User.find();
        TestCategory.find();
        TestType.find();
        TestParameter.find();
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
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt(params) {
      const { token, user } = params;
      if (user) {
        token.firstname = user?.firstname;
        token._id = user?._id;
        token.lastname = user?.lastname;
        token.role = user?.role;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (!user) {
        user = { ...token };
      }
      session.user = { ...token };
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
export default NextAuth(authOptions);
