import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { generateOTP, hashOTP, verifyOTPHash } from '../utils/otp.utils.js';
import { sendOTPEmail } from '../utils/email.utils.js';
import { generateToken } from '../utils/jwt.js';

const SALT_ROUNDS = 10;

/**
 * Strips the password field from a user object before returning it.
 * @param {object} user - Raw user object from Prisma
 * @returns {object} User object without the password field
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...sanitized } = user;
  return sanitized;
};

/**
 * Sends an OTP to the given email address.
 * Throws 409 if verified user already exists.
 *
 * @param {string} email
 * @returns {Promise<{ message: string }>}
 */
export const sendOTP = async (email) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser && existingUser.isEmailVerified) {
    throw new AppError('An account with this email already exists. Please login instead.', 409);
  }

  const rawOTP = generateOTP();
  const hashedOTP = hashOTP(rawOTP);

  await prisma.oTP.deleteMany({ where: { email } });

  await prisma.oTP.create({
    data: {
      email,
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendOTPEmail(email, rawOTP, existingUser?.name);

  return { message: 'OTP sent successfully' };
};

/**
 * Verifies an OTP for the given email address.
 *
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<{ verified: boolean, email: string }>}
 */
export const verifyOTP = async (email, otp) => {
  const record = await prisma.oTP.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    throw new AppError('No OTP found for this email. Please request a new one.', 400);
  }

  if (new Date() > new Date(record.expiresAt)) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  const isValid = verifyOTPHash(otp, record.otp);
  if (!isValid) {
    throw new AppError('Invalid OTP. Please try again.', 400);
  }

  return { verified: true, email };
};

/**
 * Completes registration for a new user after verifying OTP.
 *
 * @param {string} email
 * @param {string} otp
 * @param {string} password
 * @param {string} name
 * @param {'CLIENT'|'FREELANCER'} role
 * @returns {Promise<{ user: object, token: string }>}
 */
export const completeRegistration = async (email, otp, password, name, role) => {
  await verifyOTP(email, otp);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Check if an unverified user record exists and clean it up or update
  const existingUser = await prisma.user.findUnique({ where: { email } });

  let user;
  if (existingUser) {
    user = await prisma.user.update({
      where: { email },
      data: {
        name,
        password: hashedPassword,
        role,
        isEmailVerified: true,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isEmailVerified: true,
      },
    });
  }

  await prisma.oTP.deleteMany({ where: { email } });

  const token = generateToken({ id: user.id, role: user.role });

  return { user: sanitizeUser(user), token };
};

/**
 * Authenticates an existing user via email and password.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object, token: string }>}
 */
export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('No account found with this email. Please register first.', 401);
  }

  if (user.googleId && !user.password) {
    throw new AppError('This account uses Google login. Please continue with Google.', 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError('Please verify your email first.', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Incorrect password. Please try again.', 401);
  }

  const token = generateToken({ id: user.id, role: user.role });

  return { user: sanitizeUser(user), token };
};

/**
 * Finds or creates a user authenticated via Google OAuth.
 *
 * @param {object} googleProfile
 * @returns {Promise<object>} Sanitized user object
 */
export const findOrCreateGoogleUser = async (googleProfile) => {
  const googleId = googleProfile.id;
  const email = googleProfile.emails && googleProfile.emails[0] ? googleProfile.emails[0].value : null;
  const displayName = googleProfile.displayName || 'Google User';
  const avatar = googleProfile.photos && googleProfile.photos[0] ? googleProfile.photos[0].value : null;

  let user = await prisma.user.findUnique({ where: { googleId } });
  if (user) {
    return sanitizeUser(user);
  }

  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      user = await prisma.user.update({
        where: { email },
        data: {
          googleId,
          isEmailVerified: true,
          avatar: user.avatar || avatar,
        },
      });
      return sanitizeUser(user);
    }
  }

  user = await prisma.user.create({
    data: {
      name: displayName,
      email,
      googleId,
      avatar,
      isEmailVerified: true,
      role: 'CLIENT',
      password: null,
    },
  });

  return sanitizeUser(user);
};
