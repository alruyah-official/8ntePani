import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

/**
 * Uploads a file buffer to Cloudinary using upload_stream.
 * 
 * @param {Buffer} fileBuffer - The file data in a buffer
 * @param {string} folder - The destination folder in Cloudinary
 * @returns {Promise<{ secure_url: string, public_id: string }>} 
 */
export const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Convert Buffer to stream and pipe it to Cloudinary
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Deletes an image from Cloudinary by its public_id.
 * 
 * @param {string} publicId - The Cloudinary public ID of the image
 * @returns {Promise<any>}
 */
export const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};
