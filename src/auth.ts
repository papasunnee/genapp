import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Access from "@/models/Access";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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

        // Auth.js v5 encodes the JWT via structuredClone, which can't
        // handle a Mongoose Document (or its populated subdocuments) -
        // serialize to a plain object first.
        return JSON.parse(JSON.stringify(user));
      },
    }),
  ],
});
