import { NextRequest, NextResponse } from "next/server";
import { getOrganizationModel } from "@/models/Organization";
import { getRoleModel } from "@/models/Role";
import { getUserModel } from "@/models/User";
import { getAccessModel } from "@/models/Access";
import { getControlConnection } from "@/lib/controlPlane";
import { getTenantConnection } from "@/lib/tenantConnection";

const DEFAULT_ROLES = [
  { name: "Super Admin", weight: 100 },
  { name: "Admin", weight: 200 },
  { name: "Lab Technician", weight: 300 },
  { name: "Accountant", weight: 400 },
  { name: "Front Desk", weight: 500 },
];

/**
 * Platform-level operation - no tenant/session context exists yet for a
 * brand new organization, so this is protected by a shared secret rather
 * than a user session.
 */
export async function POST(req: NextRequest) {
  const providedSecret = req.headers.get("x-platform-secret");
  if (
    !process.env.PLATFORM_ADMIN_SECRET ||
    providedSecret !== process.env.PLATFORM_ADMIN_SECRET
  ) {
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
    // so a failure here never leaves a discoverable-but-broken org.
    const tenantConn = await getTenantConnection(dbName);
    const Role = getRoleModel(tenantConn);
    const User = getUserModel(tenantConn);
    const Access = getAccessModel(tenantConn);

    const createdRoles = await Role.insertMany(DEFAULT_ROLES);
    const superAdminRole = createdRoles.find((r) => r.weight === 100)!;

    const adminUser = await User.create({
      firstname: adminFirstname,
      lastname: adminLastname,
      email: adminEmail,
      dob: new Date("1990-01-01"),
      phone: "0000000000",
      role: superAdminRole._id,
      status: "Active",
    });
    await Access.create({ password: adminPassword, user: adminUser._id });

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
