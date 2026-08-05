"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = uploadToCloudinary;
const cloudinary_1 = require("cloudinary");
const env_js_1 = require("../config/env.js");
if (env_js_1.env.CLOUDINARY_CLOUD_NAME && env_js_1.env.CLOUDINARY_API_KEY && env_js_1.env.CLOUDINARY_API_SECRET) {
    cloudinary_1.v2.config({
        cloud_name: env_js_1.env.CLOUDINARY_CLOUD_NAME,
        api_key: env_js_1.env.CLOUDINARY_API_KEY,
        api_secret: env_js_1.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
}
async function uploadToCloudinary(fileBuffer, filename, folder = 'cwc-season-4') {
    // If Cloudinary keys are configured, upload buffer to Cloudinary
    if (env_js_1.env.CLOUDINARY_CLOUD_NAME && env_js_1.env.CLOUDINARY_API_KEY && env_js_1.env.CLOUDINARY_API_SECRET) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder,
                resource_type: 'auto',
                filename_override: filename,
                use_filename: true,
            }, (error, result) => {
                if (error || !result) {
                    return reject(error || new Error('Cloudinary upload failed'));
                }
                resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                    format: result.format,
                });
            });
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
