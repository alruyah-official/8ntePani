import prisma from '../config/prisma.js';

// Safe user fields — password is always omitted
const FREELANCER_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  avatar: true,
};

/**
 * Creates a new Service listing for a freelancer.
 * Throws 403 if the user has no FreelancerProfile (profile must be created first).
 *
 * @param {string} freelancerId - User id of the freelancer
 * @param {object} data - { categoryId, title, description, price, deliveryDays, images }
 * @returns {object} Created Service
 */
export const createService = async (freelancerId, data) => {
  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId: freelancerId },
  });

  if (!profile) {
    const error = new Error(
      'You must create a FreelancerProfile before listing a service'
    );
    error.statusCode = 403;
    throw error;
  }

  return prisma.service.create({
    data: { freelancerId, ...data },
  });
};

/**
 * Updates a Service. Ensures the service exists and belongs to the requester.
 * Throws 404 if not found, 403 if the freelancer doesn't own the service.
 *
 * @param {string} serviceId
 * @param {string} freelancerId
 * @param {object} data - Partial service fields to update
 * @returns {object} Updated Service
 */
export const updateService = async (serviceId, freelancerId, data) => {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });

  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  if (service.freelancerId !== freelancerId) {
    const error = new Error('You are not authorized to update this service');
    error.statusCode = 403;
    throw error;
  }

  return prisma.service.update({ where: { id: serviceId }, data });
};

/**
 * Deletes a Service. Ensures the service exists and belongs to the requester.
 * Throws 404 if not found, 403 if the freelancer doesn't own the service.
 *
 * @param {string} serviceId
 * @param {string} freelancerId
 * @returns {object} Deleted Service record
 */
export const deleteService = async (serviceId, freelancerId) => {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });

  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  if (service.freelancerId !== freelancerId) {
    const error = new Error('You are not authorized to delete this service');
    error.statusCode = 403;
    throw error;
  }

  return prisma.service.delete({ where: { id: serviceId } });
};

/**
 * Returns all services, with optional filtering by category, price range,
 * and a full-text search across title and description (case-insensitive).
 *
 * @param {object} filters - { categoryId?, minPrice?, maxPrice?, search? }
 * @returns {object[]} Matching services with freelancer user details and category
 */
export const getAllServices = async (filters = {}) => {
  const { categoryId, minPrice, maxPrice, search } = filters;

  // Build the where clause dynamically — only add keys that were provided
  const where = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.service.findMany({
    where,
    include: {
      freelancer: { select: FREELANCER_USER_SELECT },
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Returns a single service by id with full related data:
 * freelancer user + FreelancerProfile, category, and all reviews.
 * Throws 404 if not found.
 *
 * @param {string} serviceId
 * @returns {object} Service with all relations
 */
export const getServiceById = async (serviceId) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      freelancer: {
        select: {
          ...FREELANCER_USER_SELECT,
          freelancerProfile: true,
        },
      },
      category: true,
      reviews: {
        include: {
          client: { select: FREELANCER_USER_SELECT },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  return service;
};

/**
 * Returns all services belonging to a specific freelancer, with category details.
 *
 * @param {string} userId - Freelancer's user id
 * @returns {object[]} Services with category info
 */
export const getServicesByFreelancer = async (userId) => {
  return prisma.service.findMany({
    where: { freelancerId: userId },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};
