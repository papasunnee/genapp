import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { getPatientModel } from "@/models/Patient";
import { withTenant } from "@/lib/apiTenant";
import { hasPermission } from "@/lib/permissions";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { logActivity } from "@/lib/activityLog";

const { ObjectId } = Types;
const MAX_DOCUMENTS_PER_PATIENT = 10;

export const POST = withTenant(async (req, tenant, session, routeContext) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await routeContext.params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: "Invalid patient id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, url, publicId, resourceType } = body as {
      name?: string;
      url?: string;
      publicId?: string;
      resourceType?: "image" | "raw";
    };

    if (
      !name || typeof name !== "string" || !name.trim() ||
      !url || typeof url !== "string" ||
      !publicId || typeof publicId !== "string" ||
      (resourceType !== "image" && resourceType !== "raw")
    ) {
      return NextResponse.json(
        { success: false, error: "name, url, publicId, and resourceType are required." },
        { status: 400 }
      );
    }

    const Patient = getPatientModel(tenant.connection);
    const patient = await Patient.findById(id);
    if (!patient) {
      return NextResponse.json({ success: false, error: "Patient not found" }, { status: 404 });
    }
    if (patient.documents.length >= MAX_DOCUMENTS_PER_PATIENT) {
      return NextResponse.json(
        {
          success: false,
          error: `A patient can have at most ${MAX_DOCUMENTS_PER_PATIENT} documents attached.`,
        },
        { status: 403 }
      );
    }

    const user = session.user as any;
    patient.documents.push({
      name: name.trim().slice(0, 150),
      url,
      publicId,
      resourceType,
      uploadedBy: user?._id,
      uploadedByLabel: `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim() || undefined,
      uploadedAt: new Date(),
    } as any);
    await patient.save();

    await logActivity(
      tenant.connection,
      session,
      "patient.document_uploaded",
      `Attached document "${name.trim()}" to patient ${patient.firstname} ${patient.lastname}`
    );

    return NextResponse.json({ success: true, data: patient.documents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const DELETE = withTenant(async (req, tenant, session, routeContext) => {
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user?.role, "deleteRecords")) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { id } = await routeContext.params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: "Invalid patient id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const documentId = body.documentId;
    if (typeof documentId !== "string" || !ObjectId.isValid(documentId)) {
      return NextResponse.json({ success: false, error: "Invalid documentId" }, { status: 400 });
    }

    const Patient = getPatientModel(tenant.connection);
    const patient = await Patient.findById(id);
    if (!patient) {
      return NextResponse.json({ success: false, error: "Patient not found" }, { status: 404 });
    }

    const doc = patient.documents.find((d) => d._id?.toString() === documentId);
    if (!doc) {
      return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
    }

    patient.documents = patient.documents.filter(
      (d) => d._id?.toString() !== documentId
    ) as any;
    await patient.save();
    await deleteFromCloudinary(doc.publicId, doc.resourceType);

    await logActivity(
      tenant.connection,
      session,
      "patient.document_removed",
      `Removed document "${doc.name}" from patient ${patient.firstname} ${patient.lastname}`
    );

    return NextResponse.json({ success: true, data: patient.documents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
