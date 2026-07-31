import { NextResponse } from "next/server";
import { getOrganizationModel } from "@/models/Organization";
import { getControlConnection } from "@/lib/controlPlane";
import { withTenant } from "@/lib/apiTenant";
import { getPlanLimits } from "@/lib/planLimits";
import { logActivity } from "@/lib/activityLog";

export const GET = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const org = tenant.organization;
  return NextResponse.json({
    success: true,
    data: {
      name: org.name,
      logo: org.logo || null,
      tagline: org.tagline || null,
      address: org.address || null,
      phone: org.phone || null,
      contactEmail: org.contactEmail || null,
    },
  });
});

export const PATCH = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const requesterWeight = (session.user as any)?.role?.weight;
  if (![100, 200].includes(requesterWeight)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!getPlanLimits(tenant.organization).branding) {
    return NextResponse.json(
      {
        success: false,
        error: "Custom letterhead branding requires a Pro plan or higher.",
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { logo, tagline, address, phone, contactEmail } = body;

    const update: Record<string, any> = {};
    if (logo !== undefined) update.logo = logo;
    if (tagline !== undefined) update.tagline = tagline;
    if (address !== undefined) update.address = address;
    if (phone !== undefined) update.phone = phone;
    if (contactEmail !== undefined) update.contactEmail = contactEmail;

    const controlConn = await getControlConnection();
    const Organization = getOrganizationModel(controlConn);
    const updated = await Organization.findByIdAndUpdate(tenant.organization._id, update, {
      new: true,
      runValidators: true,
    });

    await logActivity(
      tenant.connection,
      session,
      "branding.updated",
      "Updated organization letterhead branding"
    );

    return NextResponse.json({
      success: true,
      data: {
        name: updated?.name,
        logo: updated?.logo || null,
        tagline: updated?.tagline || null,
        address: updated?.address || null,
        phone: updated?.phone || null,
        contactEmail: updated?.contactEmail || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
});
