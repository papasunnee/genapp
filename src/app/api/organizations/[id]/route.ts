import { NextRequest, NextResponse } from "next/server";
import { getOrganizationModel } from "@/models/Organization";
import { getUserModel } from "@/models/User";
import { getRoleModel } from "@/models/Role";
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
    getRoleModel(tenantConn); // registers Role on this connection for .populate("role") below
    const Patient = getPatientModel(tenantConn);
    const Test = getTestModel(tenantConn);
    const Payment = getPaymentModel(tenantConn);

    const [staffCount, patientCount, testCount, revenue, staff] = await Promise.all([
      User.countDocuments(),
      Patient.countDocuments(),
      Test.countDocuments(),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount_paid" } } }]),
      User.find()
        .select("firstname lastname email status role createdAt")
        .populate("role")
        .sort({ createdAt: 1 }),
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
        staff,
      },
    });
  } catch (error: any) {
    console.error("Failed to load organization detail:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
