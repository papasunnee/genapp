import { NextResponse } from "next/server";
import { getUserModel } from "@/models/User";
import { getPatientModel } from "@/models/Patient";
import { withTenant } from "@/lib/apiTenant";
import { getEffectivePlan, getPlanLimits } from "@/lib/planLimits";

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const org = tenant.organization;
  const User = getUserModel(tenant.connection);
  const Patient = getPatientModel(tenant.connection);

  const [staffCount, patientCount] = await Promise.all([
    User.countDocuments(),
    Patient.countDocuments(),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      plan: org.plan,
      effectivePlan: getEffectivePlan(org),
      subscriptionStatus: org.subscriptionStatus,
      limits: getPlanLimits(org),
      usage: { staffCount, patientCount },
    },
  });
});
