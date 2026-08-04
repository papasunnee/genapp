import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getRoleModel } from "@/models/Role";
import { getUserModel } from "@/models/User";
import { withTenant } from "@/lib/apiTenant";
import { getPlanLimits } from "@/lib/planLimits";
import { logActivity } from "@/lib/activityLog";
import {
  ALL_PERMISSIONS,
  STANDARD_TIERS,
  hasPermission,
  tierDefaultsForWeight,
} from "@/lib/permissions";

const { ObjectId } = Types;

const UPGRADE_ERROR = "Custom role management requires a Pro plan or higher.";

function isDuplicateNameError(error: any): boolean {
  return error?.code === 11000 && Object.keys(error.keyPattern || {})[0] === "name";
}

function isStandardTierWeight(weight: unknown): weight is number {
  const n = Number(weight);
  return STANDARD_TIERS.some((t) => t.weight === n);
}

/**
 * Only ever persists permission keys that grant something the role's base
 * tier doesn't already include - so permissionOverrides always reads as
 * "what makes this role different from a plain standard tier," never a
 * redundant restatement of the tier's own defaults.
 */
function sanitizeOverrides(weight: number, rawOverrides: unknown): Record<string, true> {
  if (!rawOverrides || typeof rawOverrides !== "object") return {};
  const defaults = tierDefaultsForWeight(weight);
  const sanitized: Record<string, true> = {};
  for (const permission of ALL_PERMISSIONS) {
    if ((rawOverrides as any)[permission] === true && !defaults[permission]) {
      sanitized[permission] = true;
    }
  }
  return sanitized;
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
    // path from the "roles I'm allowed to assign to new staff" list below.
    if (req.nextUrl.searchParams.get("all") === "true") {
      if (!hasPermission(session.user?.role, "manageRoles")) {
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
  if (!hasPermission(session.user?.role, "manageRoles")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!getPlanLimits(tenant.organization).customRoles) {
    return NextResponse.json({ success: false, error: UPGRADE_ERROR }, { status: 403 });
  }

  const Role = getRoleModel(tenant.connection);

  try {
    const body = await req.json();
    const { name, weight } = body;
    if (typeof name !== "string" || !name.trim() || !isStandardTierWeight(weight)) {
      return NextResponse.json(
        { success: false, error: "Name and a valid base tier are required" },
        { status: 400 }
      );
    }

    const numericWeight = Number(weight);
    const permissionOverrides = sanitizeOverrides(numericWeight, body.permissionOverrides);

    const newRecord = await Role.create({
      name,
      weight: numericWeight,
      status: "Active",
      permissionOverrides,
    });
    await logActivity(
      tenant.connection,
      session,
      "role.created",
      `Created role "${newRecord.name}" (base tier weight ${newRecord.weight})`
    );
    return NextResponse.json({ success: true, data: newRecord }, { status: 201 });
  } catch (error: any) {
    if (isDuplicateNameError(error)) {
      return NextResponse.json(
        { success: false, error: "A role with that name already exists." },
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
  if (!hasPermission(session.user?.role, "manageRoles")) {
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
    if (body.weight !== undefined && !isStandardTierWeight(body.weight)) {
      return NextResponse.json(
        { success: false, error: "Weight must be a valid base tier" },
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

    const effectiveWeight = weight !== undefined ? Number(weight) : existing.weight;
    const update: Record<string, any> = {};
    if (name !== undefined) update.name = name;
    if (weight !== undefined) update.weight = effectiveWeight;
    if (status !== undefined) update.status = status;
    if (body.permissionOverrides !== undefined) {
      update.permissionOverrides = sanitizeOverrides(effectiveWeight, body.permissionOverrides);
    } else if (weight !== undefined) {
      // The base tier changed but no explicit overrides were sent with
      // this request - re-sanitize the existing overrides against the new
      // tier so a permission that's now covered by the new tier's own
      // defaults doesn't linger as a redundant override.
      update.permissionOverrides = sanitizeOverrides(effectiveWeight, existing.permissionOverrides);
    }

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
    if (isDuplicateNameError(error)) {
      return NextResponse.json(
        { success: false, error: "A role with that name already exists." },
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
  if (!hasPermission(session.user?.role, "manageRoles")) {
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
