import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserModel } from "@/models/User";
import { getAccessModel } from "@/models/Access";
import { getRoleModel } from "@/models/Role";
import { getActivityLogModel } from "@/models/ActivityLog";
import {
  resolveTenant,
  resolveTenantBySubdomain,
  TenantResolutionError,
} from "@/lib/tenantContext";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      credentials: {},
      async authorize(credentials, request) {
        // Every field pulled off `credentials` is attacker-controlled JSON,
        // not a validated shape - a raw TypeScript cast (the old code:
        // `credentials as { email: string }`) doesn't check anything at
        // runtime, so a client could send `{"email": {"$ne": null}}` and
        // have that object handed straight to Mongoose as a query operator
        // instead of a string. Every value used below is verified to
        // actually be a string first.
        const rawEmail = (credentials as any)?.email;
        const rawPassword = (credentials as any)?.password;
        const rawSubdomain = (credentials as any)?.subdomain;

        if (typeof rawEmail !== "string" || typeof rawPassword !== "string") {
          throw new Error("Invalid Login Credentials");
        }
        if (rawSubdomain !== undefined && typeof rawSubdomain !== "string") {
          throw new Error("This organization could not be found.");
        }

        const email = rawEmail;
        const password = rawPassword;

        // The subdomain is normally read from the Host header - but a
        // deployment with no wildcard DNS yet (or the public demo) has no
        // subdomain to read there at all, so it can be passed explicitly
        // instead. Real logins never send this; only the demo entry point
        // does.
        const explicitSubdomain = rawSubdomain;

        let tenant;
        try {
          tenant = explicitSubdomain
            ? await resolveTenantBySubdomain(explicitSubdomain)
            : await resolveTenant(request.headers.get("host"));
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

        // Best-effort only - a logging failure must never block a login.
        try {
          const ActivityLog = getActivityLogModel(tenant.connection);
          const roleName = (user.role as any)?.name;
          await ActivityLog.create({
            user: user._id,
            userLabel: `${user.firstname} ${user.lastname}${roleName ? ` (${roleName})` : ""}`,
            action: "auth.login",
            description: `${user.firstname} ${user.lastname} signed in`,
          });
        } catch {
          // swallow
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
