import cloudinary from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';

// Selfies must come from live camera capture only. This base64 data-URL check is the sole
// ingestion path for images in this API — there is intentionally no multipart/form-data or
// file-upload endpoint anywhere in the app.
const BASE64_IMAGE_PATTERN = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/;

export const isValidBase64Image = (value) => typeof value === 'string' && BASE64_IMAGE_PATTERN.test(value);

export const uploadSelfie = async (base64Image, folder) => {
  if (!isValidBase64Image(base64Image)) {
    throw new ApiError(400, 'Selfie must be a valid base64-encoded image (camera capture only)', [
      { field: 'selfie', message: 'Expected a base64 image data URL' },
    ]);
  }

  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: 'image',
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    logger.error(`Cloudinary upload failed: ${error.message}`);
    throw new ApiError(502, 'Failed to upload selfie. Please try again.');
  }
};
