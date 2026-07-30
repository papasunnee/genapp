import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserModel } from "@/models/User";
import { getAccessModel } from "@/models/Access";
import { getRoleModel } from "@/models/Role";
import { resolveTenant, TenantResolutionError } from "@/lib/tenantContext";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      credentials: {},
      async authorize(credentials, request) {
        let tenant;
        try {
          tenant = await resolveTenant(request.headers.get("host"));
        } catch (error) {
          if (error instanceof TenantResolutionError) {
            throw new Error("This organization could not be found.");
          }
          throw error;
        }

        // Registering the related models on this connection is required
        // for .populate("role") to resolve - each tenant connection has
        // its own isolated model registry.
        const User = getUserModel(tenant.connection);
        getRoleModel(tenant.connection);
        const Access = getAccessModel(tenant.connection);

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
        return {
          ...JSON.parse(JSON.stringify(user)),
          organizationId: tenant.organization._id.toString(),
          organizationSubdomain: tenant.organization.subdomain,
        };
      },
    }),
  ],
});
