import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import {
  createProfile,
  updateProfile,
  getMyProfile,
  getProfileByUserId,
  uploadAvatar,
} from '../controllers/profile.controller.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createProfileSchema, updateProfileSchema } from '../validators/profile.validator.js';

const router = Router();

// ── Protected: FREELANCER only ────────────────────────────────────────────────

// POST /api/profile → create a new freelancer profile
router.post('/', validate(createProfileSchema), protect, restrictTo('FREELANCER'), createProfile);

// PUT  /api/profile → update the authenticated freelancer's profile
router.put('/', validate(updateProfileSchema), protect, restrictTo('FREELANCER'), updateProfile);

// ── Protected: any authenticated user ────────────────────────────────────────

// GET /api/profile/me → fetch the authenticated user's own profile
// NOTE: /me must be declared BEFORE /:userId so Express doesn't treat
//       the literal string "me" as a dynamic userId parameter.
router.get('/me', protect, getMyProfile);

// POST /api/profile/avatar → upload and update the user's avatar
router.post('/avatar', protect, uploadSingle, uploadAvatar);

// ── Public ────────────────────────────────────────────────────────────────────

// GET /api/profile/:userId → fetch any freelancer's public profile
router.get('/:userId', getProfileByUserId);

export default router;
