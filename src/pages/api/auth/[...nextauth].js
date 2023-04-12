import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import TestCategory from "@/models/TestCategory";
import TestType from "@/models/TestType";
import TestParameter from "@/models/TestParameter";

const authOptions = {
  session: {
    strategy: "jwt",
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
        const passwordCompare = await user.comparePassword(password);
        if (!passwordCompare) {
          throw new Error("Invalid Login Credentials");
        }
        delete user._doc.password;
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt(params) {
      const { token, user } = params;
      if (user) {
        token.firstname = user?.firstname;
        token.lastname = user?.lastname;
        token.role = user?.role;
      }
      return token;
    },
    async session({ session, token, user }) {
      session.user.role = user?.role ? user?.role : token.role;
      session.user.firstname = user?.firstname
        ? user?.firstname
        : token.firstname;
      session.user.lastname = user?.lastname ? user?.lastname : token.lastname;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
export default NextAuth(authOptions);
