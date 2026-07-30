import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Access from "@/models/Access";
import User from "@/models/User";
import { auth } from "@/auth";

const { ObjectId } = Types;

export async function GET(req: NextRequest) {
  const conn = await dbConnect();
  const session = await auth();
  const id = req.nextUrl.searchParams.get("id");

  try {
    if (id) {
      const singleUser = await User.findOne({ _id: id }).populate([
        { path: "role" },
      ]);
      return NextResponse.json({ success: true, data: singleUser });
    }

    const filter =
      session?.user?.role?.weight == 100 ? {} : { firstname: { $ne: "Sunday" } };
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
}

export async function POST(req: NextRequest) {
  const conn = await dbConnect();

  try {
    const body = await req.json();
    let password: string, userData: any[] = [];
    const session = await conn.startSession();
    const result = await session.withTransaction(async () => {
      userData = await User.create(
        [{ ...body, role: new ObjectId(body.role) }],
        { session }
      );
      password = "password";
      await Access.create([{ password, user: userData[0]._id }], { session });

      return userData;
    });
    session.endSession();
    if ((result as any)?.ok) {
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

    const deleteUserResponse = await User.deleteOne({ _id: delete_id });
    return NextResponse.json({ success: true, data: deleteUserResponse });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
