import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getAccessModel } from "@/models/Access";
import { getUserModel } from "@/models/User";
import { getRoleModel } from "@/models/Role";
import { withTenant } from "@/lib/apiTenant";

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

export const POST = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const User = getUserModel(tenant.connection);
  const Access = getAccessModel(tenant.connection);
  const conn = tenant.connection;

  try {
    const body = await req.json();
    let userData: any[] = [];
    const mongooseSession = await conn.startSession();
    await mongooseSession.withTransaction(async () => {
      userData = await User.create(
        [{ ...body, role: new ObjectId(body.role) }],
        { session: mongooseSession }
      );
      await Access.create(
        [{ password: "password", user: userData[0]._id }],
        { session: mongooseSession }
      );
    });
    mongooseSession.endSession();

    if (userData.length > 0) {
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

export const PUT = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const User = getUserModel(tenant.connection);

  try {
    const body = await req.json();
    const put_id = body.put_id;
    if (!put_id) {
      return NextResponse.json(
        { success: false, error: "unprocessed put_id" },
        { status: 400 }
      );
    }

    delete body._id;
    const updateUser = await User.findOneAndUpdate(
      { _id: put_id },
      { title: body.title, paragraphs: body.paragraphs },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updateUser });
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

  const User = getUserModel(tenant.connection);
  const Access = getAccessModel(tenant.connection);

  try {
    const body = await req.json();
    const delete_id = body.delete_id;
    if (!delete_id) {
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
    return NextResponse.json({ success: true, data: deleteUserResponse });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
