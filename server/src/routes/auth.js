const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validation');
const authController = require('../controllers/auth');
const { z } = require('zod');

// ── Validation schemas ────────────────────────────────────────────────────────

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['buyer', 'seller', 'both']),
  username: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// ── Public routes ─────────────────────────────────────────────────────────────

router.post('/signup', validateBody(signupSchema), authController.signup);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', validateBody(refreshSchema), authController.refreshToken);
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);

// ── Protected routes ──────────────────────────────────────────────────────────

router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.put('/password', authenticate, validateBody(updatePasswordSchema), authController.updatePassword);

module.exports = router;