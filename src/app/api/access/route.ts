import { NextResponse } from "next/server";
import { getAccessModel } from "@/models/Access";
import { withTenant } from "@/lib/apiTenant";

/**
 * Self-service password change - always acts on the caller's own Access
 * record (session.user._id), never a target id from the request body.
 */
export const PATCH = withTenant(async (req, tenant, session) => {
  if (!session?.user?._id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const Access = getAccessModel(tenant.connection);

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current and new password are required" },
        { status: 400 }
      );
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const access = await Access.findOne({ user: session.user._id });
    if (!access) {
      return NextResponse.json(
        { success: false, error: "Account credentials not found" },
        { status: 404 }
      );
    }

    const matches = await access.comparePassword(currentPassword);
    if (!matches) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    access.password = newPassword;
    await access.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
