import prisma from '../config/prisma.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * protect — Authentication guard middleware.
 *
 * Reads the JWT from the Authorization header in the format:
 *   Authorization: Bearer <token>
 *
 * Validates token, verifies user exists in database, and ensures email is verified.
 * On success  → attaches full user object to req.user and calls next()
 * On failure  → responds with 401 Unauthorized
 *
 * Usage: router.get('/protected-route', protect, controller)
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Ensure the header exists and uses Bearer scheme
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error: 'MISSING_TOKEN',
      });
    }

    // 2. Extract the raw token string
    const token = authHeader.split(' ')[1];

    // 3. Verify and decode — throws if expired or tampered
    const decoded = verifyToken(token);

    // 4. Fetch the user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isEmailVerified: true,
      },
    });

    // 5. Ensure user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
        error: 'USER_NOT_FOUND',
      });
    }

    // 6. Ensure email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email to continue.',
        error: 'EMAIL_NOT_VERIFIED',
      });
    }

    // 7. Attach user to req.user and proceed
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Access denied. Invalid or expired token.',
      error: error.message,
    });
  }
};
