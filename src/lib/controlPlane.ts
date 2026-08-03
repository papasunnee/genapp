import { getTenantConnection } from "./tenantConnection";

const CONTROL_DB_NAME = process.env.CONTROL_DB_NAME || "labsuite_control";

/**
 * The control-plane database holds the Organization registry - the one
 * thing every request needs before it knows which tenant database to use.
 * It's just another database from the connection factory's point of view.
 */
export async function getControlConnection() {
  return getTenantConnection(CONTROL_DB_NAME);
}
