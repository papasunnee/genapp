import { NextRequest, NextResponse } from "next/server";
import { getOrganizationModel } from "@/models/Organization";
import { getUserModel } from "@/models/User";
import { getPatientModel } from "@/models/Patient";
import { getTestModel } from "@/models/Test";
import { getPaymentModel } from "@/models/Payment";
import { getControlConnection } from "@/lib/controlPlane";
import { getTenantConnection } from "@/lib/tenantConnection";
import { isAuthorizedPlatformRequest } from "@/lib/platformAuth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorizedPlatformRequest(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const controlConn = await getControlConnection();
    const Organization = getOrganizationModel(controlConn);
    const organization = await Organization.findById(id);

    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    const tenantConn = await getTenantConnection(organization.dbName);
    const User = getUserModel(tenantConn);
    const Patient = getPatientModel(tenantConn);
    const Test = getTestModel(tenantConn);
    const Payment = getPaymentModel(tenantConn);

    const [staffCount, patientCount, testCount, revenue] = await Promise.all([
      User.countDocuments(),
      Patient.countDocuments(),
      Test.countDocuments(),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount_paid" } } }]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        organization,
        rootDomain: process.env.ROOT_DOMAIN || "localhost",
        stats: {
          staffCount,
          patientCount,
          testCount,
          revenue: revenue[0]?.total ?? 0,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
