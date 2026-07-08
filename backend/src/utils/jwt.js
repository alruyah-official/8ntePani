import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

/**
 * Signs a JWT token with the given payload.
 * @param {object} payload - Data to embed in the token (e.g. { id, role })
 * @returns {string} Signed JWT string
 */
export const generateToken = (payload) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifies a JWT token and returns the decoded payload.
 * Throws a JsonWebTokenError if the token is invalid or expired.
 * @param {string} token - The JWT string to verify
 * @returns {object} Decoded payload
 */
export const verifyToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.verify(token, JWT_SECRET);
};
