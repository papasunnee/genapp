import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionEventModel } from "@/models/SubscriptionEvent";
import { getControlConnection } from "@/lib/controlPlane";
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
    const SubscriptionEvent = getSubscriptionEventModel(controlConn);
    const events = await SubscriptionEvent.find({ organization: id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    console.error("Failed to load subscription history:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
