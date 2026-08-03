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
