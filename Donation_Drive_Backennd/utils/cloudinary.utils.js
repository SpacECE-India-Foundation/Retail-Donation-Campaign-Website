import { v2 as cloudinary } from "cloudinary"
import { Readable } from "stream"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export const uploadBufferToCloudinary = async (buffer, folder = "donation_drive") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
    folder,
    resource_type: "image",

    transformation: [
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
    ],
  },
  (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result);
    }
  }
    )

    Readable.from(buffer).pipe(uploadStream)
  })
}

//---------------------------------FUNCTION TO DELETE THE CLOUDINARY IMAGE DIRECTLY FROM THE CLOUD SERVER-----------------------------
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
    return await cloudinary.uploader.destroy(publicId);
}
export { cloudinary }
