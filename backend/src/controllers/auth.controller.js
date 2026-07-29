import prisma from '../config/prisma.js';
import {
  sendOTP as sendOTPService,
  verifyOTP as verifyOTPService,
  completeRegistration as completeRegistrationService,
  loginUser as loginUserService,
} from '../services/auth.service.js';
import { generateToken } from '../utils/jwt.js';

/**
 * POST /api/auth/send-otp
 * Sends a 6-digit verification code to the specified email.
 */
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await sendOTPService(email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to send OTP',
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/verify-otp
 * Validates the OTP provided by the user.
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyOTPService(email, otp);

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'OTP verification failed',
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/register
 * Completes registration after OTP verification.
 */
export const completeRegistration = async (req, res) => {
  try {
    const { email, otp, password, name, role } = req.body;
    const { user, token } = await completeRegistrationService(email, otp, password, name, role);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, token },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Registration failed',
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticates user via email and password.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUserService(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Login failed',
      error: error.message,
    });
  }
};

/**
 * GET /api/auth/google/callback
 * Handles the OAuth callback from Google, signs JWT, and redirects to frontend.
 */
export const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendURL}/login?error=google_auth_failed`);
    }

    const token = generateToken({ id: user.id, role: user.role });

    const { password, ...sanitizedUser } = user;
    const userData = Buffer.from(JSON.stringify(sanitizedUser)).toString('base64');
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

    return res.redirect(`${frontendURL}/auth/google/callback?token=${token}&user=${userData}`);
  } catch (error) {
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendURL}/login?error=google_auth_failed`);
  }
};

/**
 * GET /api/auth/me
 * Retrieves current authenticated user profile details.
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch user data',
      error: error.message,
    });
  }
};
