import { Connection } from "mongoose";
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
