import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Test from "@/models/Test";
import Patient from "@/models/Patient";

const { ObjectId } = Types;

export async function GET(req: NextRequest) {
  await dbConnect();
  const testId = req.nextUrl.searchParams.get("testId");
  const id = req.nextUrl.searchParams.get("id");
  const patientId = req.nextUrl.searchParams.get("patientId");

  try {
    if (id) {
      const singleTest: any = await Test.findOne({
        _id: new ObjectId(id),
      }).populate([
        {
          path: "payment",
          populate: {
            path: "user",
            populate: {
              path: "role",
            },
          },
        },
        {
          path: "patient",
        },
      ]);
      const resultArray = JSON.parse(singleTest.test_data);
      return NextResponse.json({ success: true, data: singleTest, resultArray });
    } else if (testId && patientId) {
      const singleTest: any = await Patient.findOne({
        _id: new ObjectId(patientId),
      }).populate({
        path: "tests",
        match: { _id: new ObjectId(testId) },
        populate: {
          path: "payment",
        },
      });
      const resultArray = JSON.parse(singleTest.tests[0].test_data);
      return NextResponse.json({ success: true, data: singleTest, resultArray });
    }
    throw new Error("Invalid Parameters");
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
