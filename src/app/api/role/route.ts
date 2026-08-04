import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getRoleModel } from "@/models/Role";
import { getUserModel } from "@/models/User";
import { withTenant } from "@/lib/apiTenant";
import { getPlanLimits } from "@/lib/planLimits";
import { logActivity } from "@/lib/activityLog";

const { ObjectId } = Types;

const MANAGE_WEIGHTS = [100, 200];
const UPGRADE_ERROR = "Custom role management requires a Pro plan or higher.";

function isDuplicateKeyError(error: any): "name" | "weight" | null {
  if (error?.code !== 11000) return null;
  const key = Object.keys(error.keyPattern || {})[0];
  return key === "weight" ? "weight" : "name";
}

/**
 * Every weight-based check elsewhere in this app (sidebar visibility, API
 * gates) assumes weights are positive whole numbers spaced out like the
 * standard tiers (100/200/300/400/500) - a negative, zero, or fractional
 * weight wouldn't break any single check, but could produce incoherent
 * access-tier boundaries wherever a comparison sits between two hardcoded
 * values.
 */
function isValidWeight(weight: unknown): boolean {
  const n = Number(weight);
  return Number.isInteger(n) && n > 0;
}

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Role = getRoleModel(tenant.connection);
  const id = req.nextUrl.searchParams.get("id");

  try {
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: "Invalid role id" },
          { status: 400 }
        );
      }
      const singleRole = await Role.findOne({ _id: id });
      return NextResponse.json({ success: true, data: singleRole });
    }

    const roleWeight = session?.user?.role?.weight;

    // The Roles management page needs the full roster (including Disabled
    // roles, unfiltered by the requester's own weight) - a separate opt-in
    // path from the "roles I'm allowed to assign to new staff" list below,
    // gated to Admin/Super Admin same as every other role mutation.
    if (req.nextUrl.searchParams.get("all") === "true") {
      if (!MANAGE_WEIGHTS.includes(roleWeight as number)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
      const User = getUserModel(tenant.connection);
      const [roles, counts] = await Promise.all([
        Role.find().sort({ weight: 1 }),
        User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      ]);
      const countByRole = new Map(counts.map((c: any) => [String(c._id), c.count]));
      const withCounts = roles.map((r) => ({
        ...r.toObject(),
        staffCount: countByRole.get(String(r._id)) ?? 0,
      }));
      return NextResponse.json({ success: true, data: withCounts });
    }

    let filter: Record<string, any> = {
      status: { $ne: "Disabled" },
      weight: { $gte: roleWeight },
    };
    if (roleWeight == 200) {
      filter = {
        status: { $ne: "Disabled" },
        weight: { $gte: 200 },
      };
    } else if (roleWeight == 500) {
      filter = {
        status: { $ne: "Disabled" },
        weight: { $gt: 200 },
      };
    }

    const allRecords = await Role.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: allRecords });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
});

export const POST = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!MANAGE_WEIGHTS.includes((session.user as any)?.role?.weight)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!getPlanLimits(tenant.organization).customRoles) {
    return NextResponse.json({ success: false, error: UPGRADE_ERROR }, { status: 403 });
  }

  const Role = getRoleModel(tenant.connection);

  try {
    const body = await req.json();
    const { name, weight } = body;
    if (typeof name !== "string" || !name.trim() || !isValidWeight(weight)) {
      return NextResponse.json(
        { success: false, error: "Name and a positive whole-number weight are required" },
        { status: 400 }
      );
    }

    const newRecord = await Role.create({ name, weight: Number(weight), status: "Active" });
    await logActivity(
      tenant.connection,
      session,
      "role.created",
      `Created role "${newRecord.name}" (weight ${newRecord.weight})`
    );
    return NextResponse.json({ success: true, data: newRecord }, { status: 201 });
  } catch (error: any) {
    const duplicateField = isDuplicateKeyError(error);
    if (duplicateField) {
      return NextResponse.json(
        {
          success: false,
          error:
            duplicateField === "weight"
              ? "Another role already uses that weight - each role needs a unique weight."
              : "A role with that name already exists.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});

export const PUT = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!MANAGE_WEIGHTS.includes((session.user as any)?.role?.weight)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!getPlanLimits(tenant.organization).customRoles) {
    return NextResponse.json({ success: false, error: UPGRADE_ERROR }, { status: 403 });
  }

  const Role = getRoleModel(tenant.connection);

  try {
    const body = await req.json();
    const put_id = body.put_id;
    if (typeof put_id !== "string" || !ObjectId.isValid(put_id)) {
      return NextResponse.json(
        { success: false, error: "unprocessed put_id" },
        { status: 400 }
      );
    }
    if (body.weight !== undefined && !isValidWeight(body.weight)) {
      return NextResponse.json(
        { success: false, error: "Weight must be a positive whole number" },
        { status: 400 }
      );
    }

    const existing = await Role.findById(put_id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Role not found" }, { status: 404 });
    }

    const { name, weight, status } = body;

    // Every weight-based permission check in this app (sidebar visibility,
    // page guards, API gates) hardcodes 100 for Super Admin - if this were
    // the organization's last role at that weight, moving it elsewhere
    // would leave nobody able to reach admin-only areas at all.
    if (existing.weight === 100 && weight !== undefined && Number(weight) !== 100) {
      const otherSuperAdminRoles = await Role.countDocuments({
        weight: 100,
        _id: { $ne: put_id },
      });
      if (otherSuperAdminRoles === 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Can't change this role's weight - it's the organization's only Super Admin-level role.",
          },
          { status: 400 }
        );
      }
    }

    const update: Record<string, any> = {};
    if (name !== undefined) update.name = name;
    if (weight !== undefined) update.weight = Number(weight);
    if (status !== undefined) update.status = status;

    const updated = await Role.findByIdAndUpdate(put_id, update, {
      new: true,
      runValidators: true,
    });
    await logActivity(
      tenant.connection,
      session,
      "role.updated",
      `Updated role "${existing.name}"${
        updated && updated.name !== existing.name ? ` (renamed to "${updated.name}")` : ""
      }`
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    const duplicateField = isDuplicateKeyError(error);
    if (duplicateField) {
      return NextResponse.json(
        {
          success: false,
          error:
            duplicateField === "weight"
              ? "Another role already uses that weight - each role needs a unique weight."
              : "A role with that name already exists.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

export const DELETE = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!MANAGE_WEIGHTS.includes((session.user as any)?.role?.weight)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!getPlanLimits(tenant.organization).customRoles) {
    return NextResponse.json({ success: false, error: UPGRADE_ERROR }, { status: 403 });
  }

  const Role = getRoleModel(tenant.connection);
  const User = getUserModel(tenant.connection);

  try {
    const body = await req.json();
    const delete_id = body.delete_id;
    if (typeof delete_id !== "string" || !ObjectId.isValid(delete_id)) {
      return NextResponse.json(
        { success: false, error: "Unprocessed delete_id" },
        { status: 400 }
      );
    }

    const role = await Role.findById(delete_id);
    if (!role) {
      return NextResponse.json({ success: false, error: "Role not found" }, { status: 404 });
    }

    const assignedCount = await User.countDocuments({ role: delete_id });
    if (assignedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `${assignedCount} staff member${
            assignedCount === 1 ? "" : "s"
          } still ${assignedCount === 1 ? "has" : "have"} this role. Reassign them first.`,
        },
        { status: 400 }
      );
    }

    if (role.weight === 100) {
      const otherSuperAdminRoles = await Role.countDocuments({
        weight: 100,
        _id: { $ne: delete_id },
      });
      if (otherSuperAdminRoles === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Can't delete the organization's only Super Admin-level role.",
          },
          { status: 400 }
        );
      }
    }

    const result = await Role.deleteOne({ _id: delete_id });
    await logActivity(tenant.connection, session, "role.deleted", `Deleted role "${role.name}"`);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
