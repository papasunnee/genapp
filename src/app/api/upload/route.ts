import { NextResponse } from "next/server";
import { withTenant } from "@/lib/apiTenant";
import { uploadImageToCloudinary, uploadDocumentToCloudinary } from "@/lib/cloudinary";
import { getPlanLimits } from "@/lib/planLimits";

const MAX_DATA_URI_LENGTH = 8_000_000; // ~6MB decoded - client already resizes before this
const MAX_DOCUMENT_DATA_URI_LENGTH = 14_000_000; // ~10MB decoded - documents aren't resized client-side

export const POST = withTenant(async (req, tenant, session) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { image, type, name } = body as {
      image?: string;
      type?: "avatar" | "logo" | "document";
      name?: string;
    };

    if (type === "document") {
      if (
        !image ||
        typeof image !== "string" ||
        !(image.startsWith("data:image/") || image.startsWith("data:application/pdf"))
      ) {
        return NextResponse.json(
          { success: false, error: "A valid image or PDF file is required." },
          { status: 400 }
        );
      }
      if (image.length > MAX_DOCUMENT_DATA_URI_LENGTH) {
        return NextResponse.json(
          { success: false, error: "File is too large - please choose a file under 10MB." },
          { status: 400 }
        );
      }
      if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { success: false, error: "A document name is required." },
          { status: 400 }
        );
      }

      const uploaded = await uploadDocumentToCloudinary(
        image,
        `documents/${tenant.organization.subdomain}`
      );
      return NextResponse.json({ success: true, data: uploaded });
    }

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
      { success: false, error: 'type must be "avatar", "logo", or "document".' },
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
