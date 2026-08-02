// Deliberately self-contained (no import from models/Organization) so this
// can be imported from client components too without dragging Mongoose
// into the browser bundle.
export type OrganizationPlan = "Free" | "Pro" | "Enterprise";
export type SubscriptionStatus = "Trial" | "Active" | "Expired" | "Cancelled";

export interface PlanLimits {
  maxStaff: number;
  maxPatients: number;
  customCatalog: boolean;
  branding: boolean;
  customRoles: boolean;
  analyticsHistoryMonths: number;
}

// A large finite sentinel, not Infinity - these limits are serialized as
// JSON to the client (JSON.stringify(Infinity) silently becomes `null`),
// and a plain number keeps every ">= limit" comparison working the same
// way on both the server and the client with no special-casing.
const UNLIMITED = 1_000_000;

export const PLAN_LIMITS: Record<OrganizationPlan, PlanLimits> = {
  Free: {
    maxStaff: 1,
    maxPatients: 5,
    customCatalog: false,
    branding: false,
    customRoles: false,
    analyticsHistoryMonths: 1,
  },
  Pro: {
    maxStaff: UNLIMITED,
    maxPatients: UNLIMITED,
    customCatalog: true,
    branding: true,
    customRoles: true,
    analyticsHistoryMonths: 6,
  },
  Enterprise: {
    maxStaff: UNLIMITED,
    maxPatients: UNLIMITED,
    customCatalog: true,
    branding: true,
    customRoles: true,
    analyticsHistoryMonths: 12,
  },
};

// The public demo is a shared sandbox, not a real customer on some plan -
// it gets its own fixed limits regardless of whatever `plan` its
// Organization record happens to carry: roomier than Free on the numeric
// caps (a prospective customer should be able to see the product actually
// work, not hit a wall after one patient), but locked out of anything that
// would let a visitor deface the shared experience for the next one
// (catalog, branding, roles).
export const DEMO_LIMITS: PlanLimits = {
  maxStaff: 3,
  maxPatients: 20,
  customCatalog: false,
  branding: false,
  customRoles: false,
  analyticsHistoryMonths: 1,
};

/**
 * A `plan` label alone isn't the whole story - an org whose subscription
 * has lapsed (Expired/Cancelled) is billed as Free regardless of what
 * `plan` still says, until a platform admin actually changes it. Every
 * gate in the app should check the effective plan, never the raw label.
 */
export function getEffectivePlan(organization: {
  plan: OrganizationPlan;
  subscriptionStatus: SubscriptionStatus;
}): OrganizationPlan {
  if (
    organization.subscriptionStatus === "Expired" ||
    organization.subscriptionStatus === "Cancelled"
  ) {
    return "Free";
  }
  return organization.plan;
}

export function getPlanLimits(organization: {
  plan: OrganizationPlan;
  subscriptionStatus: SubscriptionStatus;
  isDemo?: boolean;
}): PlanLimits {
  if (organization.isDemo) return DEMO_LIMITS;
  return PLAN_LIMITS[getEffectivePlan(organization)];
}
