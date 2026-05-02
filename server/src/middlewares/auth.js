const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * authenticate — extracts and verifies the JWT from the Authorization header.
 *
 * On success:  attaches the full Mongoose user document to req.user and calls next().
 * On failure:  returns a 401 with a specific error code so the client can act accordingly.
 *
 * Error codes:
 *   NO_TOKEN           — Authorization header missing or malformed
 *   TOKEN_EXPIRED      — Valid signature but past the exp claim
 *   TOKEN_INVALID      — Signature mismatch, malformed, or user no longer exists
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access token required.',
      code: 'NO_TOKEN',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data from DB — ensures banned/deleted users are rejected
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists.',
        code: 'TOKEN_INVALID',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Your session has expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      message: 'Invalid access token.',
      code: 'TOKEN_INVALID',
    });
  }
};

/**
 * authorize — role-based access control. Must be used AFTER authenticate.
 *
 * @param {string[]} roles  Array of allowed roles, e.g. ['seller', 'both']
 */
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.', code: 'NO_TOKEN' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `This action requires one of the following roles: ${roles.join(', ')}.`,
        code: 'FORBIDDEN',
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };