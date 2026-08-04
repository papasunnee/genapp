import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getUserModel } from "@/models/User";
import { withTenant } from "@/lib/apiTenant";
import { logActivity } from "@/lib/activityLog";
import { hasPermission } from "@/lib/permissions";

const { ObjectId } = Types;

const VALID_STATUSES = ["Active", "Suspended", "Quit", "Sacked"] as const;

/**
 * Admin-only status change on another staff member (suspend/reactivate,
 * or record that someone quit/was sacked) - deliberately separate from a
 * full delete, which permanently removes the account and its login
 * credentials. Suspending just blocks sign-in (see auth.ts) while keeping
 * every record they created intact and attributable.
 */
export const PATCH = withTenant(async (req, tenant, session, routeContext) => {
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
  if (id === session.user?._id) {
    return NextResponse.json(
      { success: false, error: "You cannot change your own status" },
      { status: 400 }
    );
  }

  const User = getUserModel(tenant.connection);

  try {
    const body = await req.json();
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const targetUser = await User.findOne({ _id: id }).populate("role");
    if (
      !targetUser ||
      requesterWeight === undefined ||
      (targetUser.role as any)?.weight < requesterWeight
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to change this user" },
        { status: 403 }
      );
    }

    targetUser.status = body.status;
    await targetUser.save();

    await logActivity(
      tenant.connection,
      session,
      "staff.status_changed",
      `Set ${targetUser.firstname} ${targetUser.lastname}'s status to ${body.status}`
    );

    return NextResponse.json({ success: true, data: targetUser });
  } catch (error: any) {
    console.error("Staff status change failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
});
