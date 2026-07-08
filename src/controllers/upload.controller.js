import { uploadToCloudinary } from '../utils/cloudinary.utils.js';

/**
 * POST /api/upload/single
 * Uploads a single image to Cloudinary.
 */
export const uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      const error = new Error('No image file provided');
      error.statusCode = 400;
      throw error;
    }

    const { secure_url, public_id } = await uploadToCloudinary(
      req.file.buffer,
      '8ntepani/general'
    );

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { secure_url, public_id },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Image upload failed',
      error: error.message,
    });
  }
};

/**
 * POST /api/upload/multiple
 * Uploads multiple images to Cloudinary in parallel.
 */
export const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      const error = new Error('No image files provided');
      error.statusCode = 400;
      throw error;
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, '8ntepani/general')
    );

    const uploadedImages = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: uploadedImages,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Images upload failed',
      error: error.message,
    });
  }
};
