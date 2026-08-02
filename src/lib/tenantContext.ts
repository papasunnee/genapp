import { Connection } from "mongoose";
import type { Session } from "next-auth";
import { getSubdomainFromHost } from "./subdomain";
import { getControlConnection } from "./controlPlane";
import { getOrganizationModel, IOrganization } from "@/models/Organization";
import { getTenantConnection } from "./tenantConnection";

export interface TenantContext {
  organization: IOrganization;
  connection: Connection;
}

export class TenantResolutionError extends Error {
  reason: "no-subdomain" | "not-found" | "suspended";
  constructor(reason: "no-subdomain" | "not-found" | "suspended", message: string) {
    super(message);
    this.reason = reason;
  }
}

async function loadTenantBySubdomain(subdomain: string): Promise<TenantContext> {
  const controlConn = await getControlConnection();
  const Organization = getOrganizationModel(controlConn);
  const organization = await Organization.findOne({ subdomain });

  if (!organization) {
    throw new TenantResolutionError(
      "not-found",
      `No organization found for subdomain "${subdomain}"`
    );
  }
  if (organization.status !== "Active") {
    throw new TenantResolutionError(
      "suspended",
      `Organization "${subdomain}" is suspended`
    );
  }

  const connection = await getTenantConnection(organization.dbName);
  return { organization, connection };
}

async function loadTenantById(organizationId: string): Promise<TenantContext> {
  const controlConn = await getControlConnection();
  const Organization = getOrganizationModel(controlConn);
  const organization = await Organization.findById(organizationId);

  if (!organization) {
    throw new TenantResolutionError("not-found", "Organization not found");
  }
  if (organization.status !== "Active") {
    throw new TenantResolutionError(
      "suspended",
      `Organization "${organization.subdomain}" is suspended`
    );
  }

  const connection = await getTenantConnection(organization.dbName);
  return { organization, connection };
}

/**
 * Resolves the tenant for a request from its Host header. This does real
 * database I/O (the control-plane Organization lookup, then a connection
 * to the tenant's own database) - Node runtime only, never call this from
 * Edge Middleware.
 */
export async function resolveTenant(
  hostHeader: string | null
): Promise<TenantContext> {
  const subdomain = getSubdomainFromHost(hostHeader);
  if (!subdomain) {
    throw new TenantResolutionError(
      "no-subdomain",
      "No tenant subdomain in request host"
    );
  }
  return loadTenantBySubdomain(subdomain);
}

/**
 * Same as resolveTenant, but for callers that already have an explicit
 * subdomain in hand (e.g. the demo entry point signing a visitor into a
 * fixed organization) rather than a Host header to parse one out of.
 */
export async function resolveTenantBySubdomain(subdomain: string): Promise<TenantContext> {
  return loadTenantBySubdomain(subdomain);
}

/**
 * Host-based resolution only works when this deployment has wildcard
 * subdomain DNS wired up. Until then (or for a deployment that never will -
 * e.g. a single fixed vercel.app URL), a request with no subdomain but a
 * valid session still knows exactly which organization it belongs to
 * (session.user.organizationId) - fall back to that instead of treating
 * every logged-in request as a tenant-resolution failure.
 */
export async function resolveTenantForRequest(
  hostHeader: string | null,
  session: Session | null
): Promise<TenantContext> {
  const subdomain = getSubdomainFromHost(hostHeader);
  if (subdomain) {
    return loadTenantBySubdomain(subdomain);
  }

  const organizationId = (session?.user as any)?.organizationId;
  if (!organizationId) {
    throw new TenantResolutionError(
      "no-subdomain",
      "No tenant subdomain in request host"
    );
  }
  return loadTenantById(organizationId);
}
