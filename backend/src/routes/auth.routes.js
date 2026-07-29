import { Router } from 'express';
import passport from '../config/passport.js';
import {
  sendOTP,
  verifyOTP,
  completeRegistration,
  login,
  googleCallback,
  getMe,
} from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import {
  sendOTPSchema,
  verifyOTPSchema,
  completeRegistrationSchema,
  loginSchema,
} from '../validators/auth.validator.js';

const router = Router();

const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

// POST /api/auth/send-otp
router.post('/send-otp', validate(sendOTPSchema), sendOTP);

// POST /api/auth/verify-otp
router.post('/verify-otp', validate(verifyOTPSchema), verifyOTP);

// POST /api/auth/register
router.post('/register', validate(completeRegistrationSchema), completeRegistration);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${frontendURL}/login?error=google_auth_failed`,
  }),
  googleCallback
);

// GET /api/auth/me
router.get('/me', protect, getMe);

export default router;
