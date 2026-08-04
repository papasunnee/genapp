import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getUserModel } from "@/models/User";
import { getAccessModel } from "@/models/Access";
import { withTenant } from "@/lib/apiTenant";
import { logActivity } from "@/lib/activityLog";
import { hasPermission } from "@/lib/permissions";

const { ObjectId } = Types;

/**
 * Admin-triggered password reset for another staff member within the same
 * organization - the "they're locked out, someone needs to help them back
 * in" flow, distinct from the self-service change at /api/access (which
 * always requires knowing the current password).
 */
export const POST = withTenant(async (req, tenant, session, routeContext) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const requesterWeight = session.user?.role?.weight;
  if (!hasPermission(session.user?.role, "manageStaff")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { id } = await routeContext.params;
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: "Invalid user id" }, { status: 400 });
  }

  const User = getUserModel(tenant.connection);
  const Access = getAccessModel(tenant.connection);

  try {
    const body = await req.json();
    const newPassword = body.newPassword;
    if (typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 128) {
      return NextResponse.json(
        { success: false, error: "Password must be between 8 and 128 characters" },
        { status: 400 }
      );
    }

    const targetUser = await User.findOne({ _id: id }).populate("role");
    if (
      !targetUser ||
      requesterWeight === undefined ||
      (targetUser.role as any)?.weight < requesterWeight
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to reset this user's password" },
        { status: 403 }
      );
    }

    const access = await Access.findOne({ user: id });
    if (!access) {
      return NextResponse.json(
        { success: false, error: "This user has no login credentials to reset" },
        { status: 404 }
      );
    }

    access.password = newPassword;
    await access.save();

    await logActivity(
      tenant.connection,
      session,
      "staff.password_reset",
      `Reset password for ${targetUser.firstname} ${targetUser.lastname}`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Staff password reset failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
});
