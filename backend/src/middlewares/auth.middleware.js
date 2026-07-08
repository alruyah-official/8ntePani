import { verifyToken } from '../utils/jwt.js';

/**
 * protect — Authentication guard middleware.
 *
 * Reads the JWT from the Authorization header in the format:
 *   Authorization: Bearer <token>
 *
 * On success  → attaches decoded payload to req.user and calls next()
 * On failure  → responds with 401 Unauthorized
 *
 * Usage: router.get('/protected-route', protect, controller)
 */
export const protect = (req, res, next) => {
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

    // 4. Attach the decoded payload so downstream handlers can use it
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Invalid or expired token.',
      error: error.message,
    });
  }
};
