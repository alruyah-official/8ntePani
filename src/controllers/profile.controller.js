import {
  createProfile as createProfileService,
  updateProfile as updateProfileService,
  getMyProfile as getMyProfileService,
  getProfileByUserId as getProfileByUserIdService,
} from '../services/profile.service.js';
import { uploadToCloudinary } from '../utils/cloudinary.utils.js';
import prisma from '../config/prisma.js';

/**
 * POST /api/profile
 * Creates a FreelancerProfile for the authenticated user.
 * Protected: FREELANCER only.
 */
export const createProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await createProfileService(userId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Freelancer profile created successfully',
      data: { profile },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create profile',
      error: error.message,
    });
  }
};

/**
 * PUT /api/profile
 * Updates the FreelancerProfile for the authenticated user.
 * Protected: FREELANCER only.
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await updateProfileService(userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update profile',
      error: error.message,
    });
  }
};

/**
 * GET /api/profile/me
 * Returns the authenticated user's own FreelancerProfile with user details.
 * Protected: any authenticated user.
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await getMyProfileService(userId);

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: { profile },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch profile',
      error: error.message,
    });
  }
};

/**
 * GET /api/profile/:userId
 * Returns a public FreelancerProfile by userId, including user details and services.
 * Public: no authentication required.
 */
export const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await getProfileByUserIdService(userId);

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: { profile },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch profile',
      error: error.message,
    });
  }
};

/**
 * POST /api/profile/avatar
 * Uploads an avatar image to Cloudinary and updates the User's avatar field.
 */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      const error = new Error('No image file provided');
      error.statusCode = 400;
      throw error;
    }

    const { secure_url } = await uploadToCloudinary(
      req.file.buffer,
      '8ntepani/avatars'
    );

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: secure_url },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to upload avatar',
      error: error.message,
    });
  }
};
