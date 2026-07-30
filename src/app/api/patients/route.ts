import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/Patient";

const { ObjectId } = Types;

export async function GET(req: NextRequest) {
  await dbConnect();
  const id = req.nextUrl.searchParams.get("id");

  try {
    if (id) {
      const singlePatient = await Patient.findOne({
        _id: new ObjectId(id),
      }).populate([
        {
          path: "tests",
          options: { sort: { createdAt: -1 } },
          populate: {
            path: "payment",
            populate: {
              path: "user",
            },
          },
        },
      ]);
      return NextResponse.json({ success: true, data: singlePatient });
    }

    const allRecords = await Patient.find().sort({ createdAt: -1 });
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
    const newRecord = await Patient.create({ ...body });
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
    const updatePatient = await Patient.findOneAndUpdate(
      { _id: put_id },
      { title: body.title, paragraphs: body.paragraphs },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatePatient });
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

    const deletePatientResponse = await Patient.deleteOne({ _id: delete_id });
    return NextResponse.json({ success: true, data: deletePatientResponse });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
