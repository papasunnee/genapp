import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getTestModel } from "@/models/Test";
import { getPatientModel } from "@/models/Patient";
import { getPaymentModel } from "@/models/Payment";
import { getUserModel } from "@/models/User";
import { getRoleModel } from "@/models/Role";
import { withTenant } from "@/lib/apiTenant";

const { ObjectId } = Types;

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Test = getTestModel(tenant.connection);
  const Patient = getPatientModel(tenant.connection);
  getPaymentModel(tenant.connection);
  getUserModel(tenant.connection);
  getRoleModel(tenant.connection);
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
});
