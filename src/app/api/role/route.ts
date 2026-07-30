import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Role from "@/models/Role";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await auth();
  const id = req.nextUrl.searchParams.get("id");

  try {
    if (id) {
      const singleRole = await Role.findOne({ _id: id });
      return NextResponse.json({ success: true, data: singleRole });
    }

    const roleWeight = session?.user?.role?.weight;
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
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const newRecord = await Role.create({ ...body });
    return NextResponse.json({ success: true, data: newRecord }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();

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
    const updateRole = await Role.findOneAndUpdate(
      { _id: put_id },
      { title: body.title, paragraphs: body.paragraphs },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updateRole });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const delete_id = body.delete_id;
    if (!delete_id) {
      return NextResponse.json(
        { success: false, error: "Unprocessed delete_id" },
        { status: 400 }
      );
    }

    const deleteRoleResponse = await Role.deleteOne({ _id: delete_id });
    return NextResponse.json({ success: true, data: deleteRoleResponse });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
