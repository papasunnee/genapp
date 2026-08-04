import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getTestCategoryModel } from "@/models/TestCategory";
import { withTenant } from "@/lib/apiTenant";
import { seedTestCatalog } from "@/lib/seedTestCatalog";
import { getPlanLimits } from "@/lib/planLimits";
import { logActivity } from "@/lib/activityLog";

const { ObjectId } = Types;

const UPGRADE_ERROR =
  "Custom test catalogs require a Pro plan or higher. Upgrade to add, edit, or remove tests.";

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await seedTestCatalog(tenant.connection);
  const TestCategory = getTestCategoryModel(tenant.connection);

  try {
    const categories = await TestCategory.find().sort({ createdAt: 1 });
    return NextResponse.json({ success: true, data: categories });
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
  if (![100, 200].includes((session.user as any)?.role?.weight)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!getPlanLimits(tenant.organization).customCatalog) {
    return NextResponse.json({ success: false, error: UPGRADE_ERROR }, { status: 403 });
  }

  const TestCategory = getTestCategoryModel(tenant.connection);

  try {
    const body = await req.json();
    const newRecord = await TestCategory.create(body);
    await logActivity(
      tenant.connection,
      session,
      "catalog.created",
      `Added test category "${newRecord.name}" to the catalog`
    );
    return NextResponse.json({ success: true, data: newRecord }, { status: 201 });
  } catch (error: any) {
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
  if (![100, 200].includes((session.user as any)?.role?.weight)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!getPlanLimits(tenant.organization).customCatalog) {
    return NextResponse.json({ success: false, error: UPGRADE_ERROR }, { status: 403 });
  }

  const TestCategory = getTestCategoryModel(tenant.connection);

  try {
    const body = await req.json();
    const put_id = body.put_id;
    if (typeof put_id !== "string" || !ObjectId.isValid(put_id)) {
      return NextResponse.json(
        { success: false, error: "unprocessed put_id" },
        { status: 400 }
      );
    }
    delete body._id;
    delete body.put_id;

    const updated = await TestCategory.findOneAndUpdate(
      { _id: put_id },
      body,
      { new: true, runValidators: true }
    );
    await logActivity(
      tenant.connection,
      session,
      "catalog.updated",
      `Updated test category "${updated?.name}"`
    );
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
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
  if (![100, 200].includes((session.user as any)?.role?.weight)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!getPlanLimits(tenant.organization).customCatalog) {
    return NextResponse.json({ success: false, error: UPGRADE_ERROR }, { status: 403 });
  }

  const TestCategory = getTestCategoryModel(tenant.connection);

  try {
    const body = await req.json();
    const delete_id = body.delete_id;
    if (typeof delete_id !== "string" || !ObjectId.isValid(delete_id)) {
      return NextResponse.json(
        { success: false, error: "Unprocessed delete_id" },
        { status: 400 }
      );
    }

    const category = await TestCategory.findById(delete_id);
    const result = await TestCategory.deleteOne({ _id: delete_id });
    await logActivity(
      tenant.connection,
      session,
      "catalog.deleted",
      `Removed test category "${category?.name ?? delete_id}" from the catalog`
    );
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
