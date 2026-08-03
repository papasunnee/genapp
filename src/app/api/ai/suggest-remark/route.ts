import { NextResponse } from "next/server";
import { withTenant } from "@/lib/apiTenant";
import { getPlanLimits } from "@/lib/planLimits";
import { generateResultRemark, RemarkParameter } from "@/lib/anthropic";
import { logActivity } from "@/lib/activityLog";

const ALLOWED_WEIGHTS = [100, 200, 300];

export const POST = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!ALLOWED_WEIGHTS.includes((session.user as any)?.role?.weight)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!getPlanLimits(tenant.organization).aiAssistance) {
    return NextResponse.json(
      {
        success: false,
        error: "AI-assisted result interpretation requires a Pro plan or higher.",
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { testTitle, parameters } = body as {
      testTitle?: string;
      parameters?: RemarkParameter[];
    };

    if (!testTitle || !Array.isArray(parameters) || parameters.length === 0) {
      return NextResponse.json(
        { success: false, error: "testTitle and at least one parameter are required." },
        { status: 400 }
      );
    }

    const suggestion = await generateResultRemark(testTitle, parameters);

    await logActivity(
      tenant.connection,
      session,
      "ai.suggestion_generated",
      `Requested an AI-drafted remark for "${testTitle}" - still requires review and approval before saving`
    );

    return NextResponse.json({ success: true, data: { suggestion } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
