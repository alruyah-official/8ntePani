import {
  createProfile as createProfileService,
  updateProfile as updateProfileService,
  getMyProfile as getMyProfileService,
  getProfileByUserId as getProfileByUserIdService,
} from '../services/profile.service.js';

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
