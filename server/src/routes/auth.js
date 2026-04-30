const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validation');
const authController = require('../controllers/auth');
const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['buyer', 'seller', 'both']),
  username: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

router.post('/signup', validateBody(signupSchema), authController.signup);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.put('/password', authenticate, validateBody(updatePasswordSchema), authController.updatePassword);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;