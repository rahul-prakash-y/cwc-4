import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  filename: string,
  folder: string = 'cwc-season-4'
): Promise<{ url: string; public_id: string; format: string }> {
  // If Cloudinary keys are configured, upload buffer to Cloudinary
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          filename_override: filename,
          use_filename: true,
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload failed'));
          }
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  // Fallback mode for development/testing when Cloudinary keys are not configured
  const cleanName = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
  const mockId = `${folder}/${Date.now()}_${cleanName}`;
  const isPdf = filename.toLowerCase().endsWith('.pdf');
  const format = isPdf ? 'pdf' : 'png';
  const mockUrl = `https://res.cloudinary.com/demo/image/upload/v${Date.now()}/${mockId}.${format}`;

  return {
    url: mockUrl,
    public_id: mockId,
    format,
  };
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!publicId) return false;
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

