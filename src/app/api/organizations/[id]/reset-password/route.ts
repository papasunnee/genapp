import { NextRequest, NextResponse } from "next/server";
import { getOrganizationModel } from "@/models/Organization";
import { getUserModel } from "@/models/User";
import { getAccessModel } from "@/models/Access";
import { getControlConnection } from "@/lib/controlPlane";
import { getTenantConnection } from "@/lib/tenantConnection";
import { isAuthorizedPlatformRequest } from "@/lib/platformAuth";
import { logActivity } from "@/lib/activityLog";

/**
 * Platform-admin-only: resets a staff member's password within an
 * organization's tenant database - the support-desk equivalent of "user
 * forgot their password, and there's no self-serve reset flow yet."
 * Logged to the org's own activity log so the change is visible to the
 * organization too, not just at the platform level.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorizedPlatformRequest(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Missing user or new password" },
        { status: 400 }
      );
    }
    if (String(newPassword).length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const controlConn = await getControlConnection();
    const Organization = getOrganizationModel(controlConn);
    const organization = await Organization.findById(id);
    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    const tenantConn = await getTenantConnection(organization.dbName);
    const User = getUserModel(tenantConn);
    const Access = getAccessModel(tenantConn);

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const access = await Access.findOne({ user: userId });
    if (!access) {
      return NextResponse.json(
        { success: false, error: "This user has no login credentials to reset" },
        { status: 404 }
      );
    }

    // Assigning the plain value and calling save() (not updateOne) so
    // Access's pre-save hook re-hashes it - the same path a normal
    // password change goes through.
    access.password = newPassword;
    await access.save();

    await logActivity(
      tenantConn,
      null,
      "user.password_reset_by_platform",
      `Password reset for ${user.firstname} ${user.lastname} (${user.email}) by a LabSuite platform administrator`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
