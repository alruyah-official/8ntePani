import prisma from '../config/prisma.js';

// Fields we always select when joining the User table — password is intentionally omitted.
const USER_SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  role: true,
  createdAt: true,
};

/**
 * Creates a new FreelancerProfile for the given user.
 * Throws 409 if a profile already exists for this user.
 *
 * @param {string} userId
 * @param {object} data - { bio, skills, location, languages }
 * @returns {object} Newly created FreelancerProfile
 */
export const createProfile = async (userId, data) => {
  const existing = await prisma.freelancerProfile.findUnique({
    where: { userId },
  });

  if (existing) {
    const error = new Error('A profile already exists for this account');
    error.statusCode = 409;
    throw error;
  }

  const profile = await prisma.freelancerProfile.create({
    data: { userId, ...data },
  });

  return profile;
};

/**
 * Updates an existing FreelancerProfile for the given user.
 * Throws 404 if no profile is found.
 *
 * @param {string} userId
 * @param {object} data - Partial { bio, skills, location, languages }
 * @returns {object} Updated FreelancerProfile
 */
export const updateProfile = async (userId, data) => {
  const existing = await prisma.freelancerProfile.findUnique({
    where: { userId },
  });

  if (!existing) {
    const error = new Error('Profile not found. Create one first.');
    error.statusCode = 404;
    throw error;
  }

  const profile = await prisma.freelancerProfile.update({
    where: { userId },
    data,
  });

  return profile;
};

/**
 * Fetches the authenticated freelancer's own profile, including their
 * basic user details (name, email, avatar — no password).
 * Throws 404 if no profile is found.
 *
 * @param {string} userId
 * @returns {object} FreelancerProfile with nested user data
 */
export const getMyProfile = async (userId) => {
  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId },
    include: {
      user: { select: USER_SAFE_SELECT },
    },
  });

  if (!profile) {
    const error = new Error('Profile not found');
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

/**
 * Fetches a freelancer's public profile by userId, including their
 * user details and all services they have listed.
 * Throws 404 if no profile is found.
 *
 * @param {string} userId
 * @returns {object} FreelancerProfile with nested user and services data
 */
export const getProfileByUserId = async (userId) => {
  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          ...USER_SAFE_SELECT,
          services: true,
        },
      },
    },
  });

  if (!profile) {
    const error = new Error('Freelancer profile not found');
    error.statusCode = 404;
    throw error;
  }

  return profile;
};
