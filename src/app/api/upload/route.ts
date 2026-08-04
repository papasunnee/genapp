import { NextResponse } from "next/server";
import { withTenant } from "@/lib/apiTenant";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { getPlanLimits } from "@/lib/planLimits";

const MAX_DATA_URI_LENGTH = 8_000_000; // ~6MB decoded - client already resizes before this

export const POST = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { image, type } = body as { image?: string; type?: "avatar" | "logo" };

    if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
      return NextResponse.json(
        { success: false, error: "A valid image is required." },
        { status: 400 }
      );
    }
    if (image.length > MAX_DATA_URI_LENGTH) {
      return NextResponse.json(
        { success: false, error: "Image is too large." },
        { status: 400 }
      );
    }

    if (type === "logo") {
      const weight = (session.user as any)?.role?.weight;
      if (![100, 200].includes(weight)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
      if (!getPlanLimits(tenant.organization).branding) {
        return NextResponse.json(
          { success: false, error: "Custom letterhead branding requires a Pro plan or higher." },
          { status: 403 }
        );
      }

      const url = await uploadImageToCloudinary(
        image,
        `logos/${tenant.organization.subdomain}`,
        "logo"
      );
      return NextResponse.json({ success: true, data: { url } });
    }

    if (type === "avatar") {
      const url = await uploadImageToCloudinary(
        image,
        `avatars/${tenant.organization.subdomain}`,
        String(session.user?._id)
      );
      return NextResponse.json({ success: true, data: { url } });
    }

    return NextResponse.json(
      { success: false, error: 'type must be "avatar" or "logo".' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
});
