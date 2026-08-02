import { NextResponse } from "next/server";
import { getOrganizationModel } from "@/models/Organization";
import { getRoleModel } from "@/models/Role";
import { getUserModel } from "@/models/User";
import { getAccessModel } from "@/models/Access";
import { getPatientModel } from "@/models/Patient";
import { getTestModel } from "@/models/Test";
import { getPaymentModel } from "@/models/Payment";
import { getActivityLogModel } from "@/models/ActivityLog";
import { getControlConnection } from "@/lib/controlPlane";
import { getTenantConnection } from "@/lib/tenantConnection";
import { seedTestCatalog } from "@/lib/seedTestCatalog";
import { seedDemoSampleData } from "@/lib/seedDemoData";

const DEMO_SUBDOMAIN = "demo";
const DEMO_DB_NAME = "labflow_demo";
const DEMO_USER_EMAIL = "demo@labflow.app";
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD || "labflowdemo";
const RESET_INTERVAL_MINUTES = Number(process.env.DEMO_RESET_INTERVAL_MINUTES) || 30;

const DEFAULT_ROLES = [
  { name: "Super Admin", weight: 100 },
  { name: "Admin", weight: 200 },
  { name: "Lab Technician", weight: 300 },
  { name: "Accountant", weight: 400 },
  { name: "Front Desk", weight: 500 },
];

/**
 * Idempotent: ensures the demo organization, its tenant database, and a
 * fixed demo login exist, then wipes and reseeds its transactional data
 * if the last reset is stale. Runs on every visit to /demo rather than on
 * a cron, so the guarantee ("demo data doesn't stick around") holds
 * regardless of what scheduling this deployment does or doesn't have -
 * repeated calls within the reset window are cheap no-ops past the first
 * organization lookup.
 */
export async function POST() {
  try {
    const controlConn = await getControlConnection();
    const Organization = getOrganizationModel(controlConn);

    let organization = await Organization.findOne({ subdomain: DEMO_SUBDOMAIN });
    if (!organization) {
      organization = await Organization.create({
        name: "LabFlow Demo",
        subdomain: DEMO_SUBDOMAIN,
        dbName: DEMO_DB_NAME,
        status: "Active",
        plan: "Free",
        subscriptionStatus: "Active",
        isDemo: true,
        tagline: "Public demo - shared sandbox, resets periodically",
      });
    }

    const tenantConn = await getTenantConnection(organization.dbName);
    const Role = getRoleModel(tenantConn);
    const User = getUserModel(tenantConn);
    const Access = getAccessModel(tenantConn);

    let demoUser = await User.findOne({ email: DEMO_USER_EMAIL });
    if (!demoUser) {
      const roles = await Role.find();
      const roleDocs = roles.length > 0 ? roles : await Role.insertMany(DEFAULT_ROLES);
      const superAdminRole = roleDocs.find((r) => r.weight === 100)!;

      demoUser = await User.create({
        firstname: "Demo",
        lastname: "User",
        email: DEMO_USER_EMAIL,
        dob: new Date("1990-01-01"),
        phone: "0000000000",
        role: superAdminRole._id,
        status: "Active",
      });
      await Access.create({ password: DEMO_USER_PASSWORD, user: demoUser._id });
    }

    await seedTestCatalog(tenantConn);

    const staleAfter = new Date(Date.now() - RESET_INTERVAL_MINUTES * 60 * 1000);
    const needsReset = !organization.demoLastResetAt || organization.demoLastResetAt < staleAfter;

    if (needsReset) {
      const Patient = getPatientModel(tenantConn);
      const Test = getTestModel(tenantConn);
      const Payment = getPaymentModel(tenantConn);
      const ActivityLog = getActivityLogModel(tenantConn);

      await Promise.all([
        Patient.deleteMany({}),
        Test.deleteMany({}),
        Payment.deleteMany({}),
        ActivityLog.deleteMany({}),
      ]);
      await seedDemoSampleData(tenantConn, demoUser._id);

      organization.demoLastResetAt = new Date();
      await organization.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        subdomain: DEMO_SUBDOMAIN,
        email: DEMO_USER_EMAIL,
        password: DEMO_USER_PASSWORD,
        wasReset: needsReset,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
