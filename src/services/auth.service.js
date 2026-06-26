import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { generateToken } from '../utils/jwt.js';

const SALT_ROUNDS = 10;

/**
 * Strips the password field from a user object before returning it.
 * @param {object} user - Raw user object from Prisma
 * @returns {object} User object without the password field
 */
const sanitizeUser = ({ password, ...user }) => user;

/**
 * Registers a new user on the platform.
 * Throws if the email is already taken.
 *
 * @param {string} name
 * @param {string} email
 * @param {string} password  Plain-text password (will be hashed)
 * @param {'CLIENT'|'FREELANCER'} role
 * @returns {object} Created user without the password field
 */
export const registerUser = async (name, email, password, role) => {
  // 1. Guard: reject duplicate emails
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  // 2. Hash the plain-text password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. Persist the new user
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  // 4. Return without exposing the hash
  return sanitizeUser(user);
};

/**
 * Authenticates an existing user and returns a signed JWT.
 * Throws if the email is not found or the password does not match.
 *
 * @param {string} email
 * @param {string} password  Plain-text password to compare
 * @returns {{ token: string, user: object }} Token and sanitized user
 */
export const loginUser = async (email, password) => {
  // 1. Look up the user — include password for comparison
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // 2. Constant-time password comparison via bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // 3. Sign a token with the minimal necessary claims
  const token = generateToken({ id: user.id, role: user.role });

  // 4. Return token alongside the sanitized user object
  return { token, user: sanitizeUser(user) };
};
