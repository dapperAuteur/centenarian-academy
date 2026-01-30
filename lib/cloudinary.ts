import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Generates a time-limited signed URL for private Cloudinary videos.
 * @param publicId The Cloudinary Public ID (e.g., 'academy/chapter1/lesson1')
 * @param ttl Time to live in seconds (default 1 hour)
 */
export async function getSignedVideoUrl(publicId: string, ttl: number = 3600) {
  try {
    return cloudinary.utils.private_download_url(publicId, 'mp4', {
      resource_type: 'video',
      expires_at: Math.floor(Date.now() / 1000) + ttl,
    });
  } catch (error) {
    console.error("Cloudinary Signed URL Error:", error);
    throw new Error("Failed to generate secure video link.");
  }
}

export default cloudinary;