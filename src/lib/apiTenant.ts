import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import {
  resolveTenantForRequest,
  TenantResolutionError,
  TenantContext,
} from "./tenantContext";

type Handler = (
  req: NextRequest,
  tenant: TenantContext,
  session: Session | null
) => Promise<NextResponse>;

/**
 * Wraps a Route Handler with tenant resolution: figures out which
 * organization this request belongs to (from the subdomain), gets that
 * org's database connection, and - as defense in depth against a stale
 * session being replayed against the wrong subdomain - rejects if the
 * caller's session belongs to a different organization.
 */
export function withTenant(handler: Handler) {
  return async function (req: NextRequest): Promise<NextResponse> {
    try {
      const session = await auth();
      const tenant = await resolveTenantForRequest(req.headers.get("host"), session);

      if (
        session?.user?.organizationId &&
        session.user.organizationId !== tenant.organization._id.toString()
      ) {
        return NextResponse.json(
          { success: false, error: "Session does not match this organization" },
          { status: 401 }
        );
      }

      return await handler(req, tenant, session);
    } catch (error) {
      if (error instanceof TenantResolutionError) {
        const status = error.reason === "no-subdomain" ? 400 : 404;
        return NextResponse.json(
          { success: false, error: error.message },
          { status }
        );
      }
      throw error;
    }
  };
}
