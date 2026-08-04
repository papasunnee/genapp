import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const ROOT_FOLDER = "labsuite";

/**
 * Uploads a data URI (already resized client-side via resizeImageToDataUrl)
 * to Cloudinary under labsuite/<folder>, returning the hosted URL to store
 * on the record instead of the raw image data. Cloudinary also downsizes/
 * transcodes on its end (quality/format auto), so the file it serves back
 * is smaller again than what was uploaded.
 */
export async function uploadImageToCloudinary(
  dataUri: string,
  folder: string,
  publicId?: string
): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary is not configured on this server.");
  }

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `${ROOT_FOLDER}/${folder}`,
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return result.secure_url;
}

/**
 * Uploads a scanned consent form / referral letter / other patient
 * document. Unlike uploadImageToCloudinary, this accepts PDFs as well as
 * images and skips the lossy quality/format transform - these are records,
 * not display assets, so what's uploaded is what should come back on
 * download. resource_type: "auto" lets Cloudinary classify images vs. raw
 * (PDF) itself. publicId is left undefined so each upload gets its own
 * unique id - unlike avatars/logos, a patient can have many documents.
 */
export async function uploadDocumentToCloudinary(
  dataUri: string,
  folder: string
): Promise<{ url: string; publicId: string; resourceType: "image" | "raw" }> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary is not configured on this server.");
  }

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `${ROOT_FOLDER}/${folder}`,
    resource_type: "auto",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type === "raw" ? "raw" : "image",
  };
}

/**
 * Removes a previously uploaded patient document from Cloudinary. Best-
 * effort: called after the record is already removed from Mongo, so a
 * failure here shouldn't block that - it would just leave an orphaned
 * file in Cloudinary rather than corrupt any data the app reads.
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "raw"
): Promise<void> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch {
    // Swallow - an orphaned Cloudinary file is a cleanup issue, not a data-integrity one.
  }
}
