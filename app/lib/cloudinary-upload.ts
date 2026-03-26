import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

/**
 * Gets a configured Cloudinary instance (singleton pattern)
 * Configures on first call using environment variables
 */
export function getCloudinaryClient() {
  if (!isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    isConfigured = true;
  }
  return cloudinary;
}

/**
 * Uploads an image to Cloudinary
 * @param imageData - Base64 image data (with data URL prefix) or buffer
 * @param folderPath - Folder path to store the image
 * @returns Upload response with secure_url and public_id
 */
export async function uploadImageToCloudinary(
  imageData: string,
  folderPath: string
) {
  const client = getCloudinaryClient();

  return await client.uploader.upload(imageData, {
    folder: folderPath,
    resource_type: 'image'
  });
}
