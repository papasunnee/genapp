import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getAccessModel } from "@/models/Access";
import { getUserModel } from "@/models/User";
import { getRoleModel } from "@/models/Role";
import { withTenant } from "@/lib/apiTenant";
import { getPlanLimits } from "@/lib/planLimits";
import { logActivity } from "@/lib/activityLog";

const { ObjectId } = Types;

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const User = getUserModel(tenant.connection);
  const Role = getRoleModel(tenant.connection);
  const id = req.nextUrl.searchParams.get("id");

  try {
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: "Invalid user id" },
          { status: 400 }
        );
      }
      const singleUser = await User.findOne({ _id: id }).populate([
        { path: "role" },
      ]);
      return NextResponse.json({ success: true, data: singleUser });
    }

    const requesterWeight = session.user?.role?.weight;
    let filter: Record<string, any> = {};
    if (requesterWeight !== 100) {
      // Never expose users whose role outranks the requester's own.
      const higherPrivilegeRoles = await Role.find({
        weight: { $lt: requesterWeight },
      }).select("_id");
      filter = { role: { $nin: higherPrivilegeRoles.map((r) => r._id) } };
    }

    const allRecords = await User.find(filter)
      .populate([{ path: "role" }])
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: allRecords });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
});

const CREATABLE_STAFF_FIELDS = [
  "firstname",
  "lastname",
  "email",
  "dob",
  "phone",
  "lab_no",
  "gender",
  "address",
  "city",
  "country",
  "description",
] as const;

export const POST = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  // Only Super Admin/Admin may add staff - without this check any signed-in
  // account (e.g. a Front Desk user) could create new accounts, and could
  // hand them any role at all (see the weight check below).
  const requesterWeight = session.user?.role?.weight;
  if (![100, 200].includes(requesterWeight as number)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const User = getUserModel(tenant.connection);
  const Access = getAccessModel(tenant.connection);
  const Role = getRoleModel(tenant.connection);
  const conn = tenant.connection;

  try {
    const limits = getPlanLimits(tenant.organization);
    const staffCount = await User.countDocuments();
    if (staffCount >= limits.maxStaff) {
      return NextResponse.json(
        {
          success: false,
          error: `Your ${tenant.organization.plan} plan is limited to ${limits.maxStaff} staff accounts. Upgrade to add more.`,
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (typeof body.role !== "string" || !ObjectId.isValid(body.role)) {
      return NextResponse.json(
        { success: false, error: "A valid role must be selected" },
        { status: 400 }
      );
    }
    const targetRole = await Role.findById(body.role);
    if (!targetRole) {
      return NextResponse.json({ success: false, error: "Role not found" }, { status: 400 });
    }
    // Same rule enforced on DELETE: a requester can never grant a role more
    // privileged than their own (lower weight = higher privilege).
    if (targetRole.weight < (requesterWeight ?? 0)) {
      return NextResponse.json(
        { success: false, error: "Not authorized to assign this role" },
        { status: 403 }
      );
    }

    const password = body.password;
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const userFields: Record<string, any> = { role: targetRole._id };
    for (const field of CREATABLE_STAFF_FIELDS) {
      if (body[field] !== undefined) userFields[field] = body[field];
    }

    let userData: any[] = [];
    const mongooseSession = await conn.startSession();
    await mongooseSession.withTransaction(async () => {
      userData = await User.create([userFields], { session: mongooseSession });
      await Access.create(
        [{ password, user: userData[0]._id }],
        { session: mongooseSession }
      );
    });
    mongooseSession.endSession();

    if (userData.length > 0) {
      await logActivity(
        tenant.connection,
        session,
        "staff.created",
        `Added staff member ${userData[0].firstname} ${userData[0].lastname}`
      );
      return NextResponse.json(
        { success: true, data: userData[0] },
        { status: 201 }
      );
    }
    throw new Error("Error Creating User");
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});

// Self-service profile edit only - a user updates their own record, never
// someone else's (no target id is even accepted from the request body).
// The previous version accepted an arbitrary put_id with no ownership
// check at all, and only wrote to title/paragraphs fields that don't
// exist on this schema, so it never actually updated a profile.
const EDITABLE_PROFILE_FIELDS = [
  "firstname",
  "lastname",
  "phone",
  "address",
  "city",
  "country",
  "gender",
  "description",
  "image_url",
] as const;

export const PUT = withTenant(async (req, tenant, session) => {
  if (!session?.user?._id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const User = getUserModel(tenant.connection);

  try {
    const body = await req.json();
    const update: Record<string, any> = {};
    for (const field of EDITABLE_PROFILE_FIELDS) {
      if (body[field] !== undefined) update[field] = body[field];
    }

    const updatedUser = await User.findByIdAndUpdate(session.user._id, update, {
      new: true,
      runValidators: true,
    }).populate("role");

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});

export const DELETE = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const User = getUserModel(tenant.connection);
  const Access = getAccessModel(tenant.connection);

  try {
    const body = await req.json();
    const delete_id = body.delete_id;
    if (typeof delete_id !== "string" || !ObjectId.isValid(delete_id)) {
      return NextResponse.json(
        { success: false, error: "Unprocessed delete_id" },
        { status: 400 }
      );
    }

    if (delete_id === session.user?._id) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Same rule as the GET listing: never let a requester act on a user
    // whose role outranks their own (lower weight = higher privilege).
    const targetUser = await User.findOne({ _id: delete_id }).populate("role");
    const requesterWeight = session.user?.role?.weight;
    if (
      !targetUser ||
      requesterWeight === undefined ||
      (targetUser.role as any)?.weight < requesterWeight
    ) {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this user" },
        { status: 403 }
      );
    }

    const deleteUserResponse = await User.deleteOne({ _id: delete_id });
    await Access.deleteOne({ user: delete_id });
    await logActivity(
      tenant.connection,
      session,
      "staff.removed",
      `Removed staff member ${targetUser.firstname} ${targetUser.lastname}`
    );
    return NextResponse.json({ success: true, data: deleteUserResponse });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
