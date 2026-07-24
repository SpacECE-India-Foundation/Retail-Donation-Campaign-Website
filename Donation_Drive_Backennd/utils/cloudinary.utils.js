import fs from "fs"
import { v2 as cloudinary } from "cloudinary"
import { Readable } from "stream"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// Default transformation — tuned for wide campaign banner/hero images (16:9).
// Callers that need a different shape (e.g. square avatars) can pass their own
// `transformationOverride` instead of getting this one.
const DEFAULT_BANNER_TRANSFORMATION = [
  {
    width: 1200,
    height: 675,
    crop: "fill",
    gravity: "auto",
  },
  {
    quality: "auto",
  },
  {
    fetch_format: "auto",
  },
  {
    flags: "progressive",
  },
]

export const uploadBufferToCloudinary = async (
  bufferOrPath,
  folder = "donation_drive",
  resourceType = "image",
  transformationOverride
) => {
  const maxAttempts = 3;

  const uploadOnce = () => new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        // PDF uploads can take longer than image uploads, especially on a cold
        // server or a slow connection to Cloudinary.
        timeout: 120000,
        transformation:
          resourceType === "image"
            ? transformationOverride ?? DEFAULT_BANNER_TRANSFORMATION
            : undefined,
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )

    if (typeof bufferOrPath === "string") {
      fs.createReadStream(bufferOrPath).pipe(uploadStream)
    } else if (Buffer.isBuffer(bufferOrPath)) {
      Readable.from(bufferOrPath).pipe(uploadStream)
    } else if (bufferOrPath instanceof ArrayBuffer || ArrayBuffer.isView(bufferOrPath)) {
      Readable.from(Buffer.from(bufferOrPath)).pipe(uploadStream)
    } else {
      reject(new Error("uploadBufferToCloudinary expects a Buffer or local file path"))
    }
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await uploadOnce();
    } catch (error) {
      const isTransient =
        error?.http_code === 408 ||
        ["ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"].includes(error?.code) ||
        /request timeout|timed out/i.test(error?.message || "");

      if (!isTransient || attempt === maxAttempts) {
        throw error;
      }

      const retryDelayMs = attempt * 1000;
      console.warn(
        `Cloudinary upload attempt ${attempt} failed; retrying in ${retryDelayMs}ms: ${error.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}

//---------------------------------FUNCTION TO DELETE THE CLOUDINARY IMAGE DIRECTLY FROM THE CLOUD SERVER-----------------------------
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
    return await cloudinary.uploader.destroy(publicId);
}
export { cloudinary }