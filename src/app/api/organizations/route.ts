import { NextRequest, NextResponse } from "next/server";
import { getOrganizationModel } from "@/models/Organization";
import { getRoleModel } from "@/models/Role";
import { getUserModel } from "@/models/User";
import { getAccessModel } from "@/models/Access";
import { getTestCategoryModel } from "@/models/TestCategory";
import { getControlConnection } from "@/lib/controlPlane";
import { getTenantConnection } from "@/lib/tenantConnection";
import { seedTestCatalog } from "@/lib/seedTestCatalog";
import { isAuthorizedPlatformRequest } from "@/lib/platformAuth";

const DEFAULT_ROLES = [
  { name: "Super Admin", weight: 100 },
  { name: "Admin", weight: 200 },
  { name: "Lab Technician", weight: 300 },
  { name: "Accountant", weight: 400 },
  { name: "Front Desk", weight: 500 },
];

/**
 * Platform-level operations - no tenant/session context exists for these
 * (an organization is the thing being managed, not a tenant a session
 * belongs to), so they're protected by either the shared secret header
 * (script/CLI callers) or the platform admin's browser session cookie.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorizedPlatformRequest(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const controlConn = await getControlConnection();
    const Organization = getOrganizationModel(controlConn);
    const organizations = await Organization.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: organizations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorizedPlatformRequest(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { id, status, plan, subscriptionStatus, subscriptionRenewsAt } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing organization id" },
        { status: 400 }
      );
    }

    const update: Record<string, any> = {};
    if (status !== undefined) update.status = status;
    if (plan !== undefined) update.plan = plan;
    if (subscriptionStatus !== undefined) update.subscriptionStatus = subscriptionStatus;
    if (subscriptionRenewsAt !== undefined) {
      update.subscriptionRenewsAt = subscriptionRenewsAt ? new Date(subscriptionRenewsAt) : null;
    }

    const controlConn = await getControlConnection();
    const Organization = getOrganizationModel(controlConn);
    const organization = await Organization.findByIdAndUpdate(id, update, { new: true });

    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: organization });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedPlatformRequest(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { name, subdomain, adminEmail, adminFirstname, adminLastname, adminPassword } =
      body;

    if (!name || !subdomain || !adminEmail || !adminFirstname || !adminLastname || !adminPassword) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const controlConn = await getControlConnection();
    const Organization = getOrganizationModel(controlConn);

    const existing = await Organization.findOne({ subdomain });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Subdomain already taken" },
        { status: 409 }
      );
    }

    const dbName = `labflow_tenant_${subdomain}`;

    // Seed the tenant's own data first, and only register the Organization
    // (the thing that makes this tenant reachable) once that succeeds -
    // so a failure here never leaves a discoverable-but-broken org. If any
    // seed step fails partway (e.g. bad admin email), roll back what was
    // already written so the tenant database doesn't end up holding
    // orphaned data under a subdomain nothing points to.
    const tenantConn = await getTenantConnection(dbName);
    const Role = getRoleModel(tenantConn);
    const User = getUserModel(tenantConn);
    const Access = getAccessModel(tenantConn);
    const TestCategory = getTestCategoryModel(tenantConn);

    let createdRoles: Array<{ _id: unknown; weight: number }> = [];
    let adminUser: { _id: unknown } | null = null;
    try {
      createdRoles = await Role.insertMany(DEFAULT_ROLES);
      const superAdminRole = createdRoles.find((r) => r.weight === 100)!;

      adminUser = await User.create({
        firstname: adminFirstname,
        lastname: adminLastname,
        email: adminEmail,
        dob: new Date("1990-01-01"),
        phone: "0000000000",
        role: superAdminRole._id,
        status: "Active",
      });
      await Access.create({ password: adminPassword, user: adminUser._id });
      await seedTestCatalog(tenantConn);
    } catch (seedError) {
      await Promise.all([
        Role.deleteMany({ _id: { $in: createdRoles.map((r) => r._id) } }),
        adminUser ? User.deleteOne({ _id: adminUser._id }) : Promise.resolve(),
        adminUser ? Access.deleteOne({ user: adminUser._id }) : Promise.resolve(),
        TestCategory.deleteMany({}),
      ]);
      throw seedError;
    }

    const organization = await Organization.create({
      name,
      subdomain,
      dbName,
      status: "Active",
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          organization: {
            name: organization.name,
            subdomain: organization.subdomain,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
