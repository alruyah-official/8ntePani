import prisma from '../config/prisma.js';

// Safe user fields — password is always omitted
const CLIENT_SAFE_SELECT = {
  id: true,
  name: true,
  avatar: true,
};

/**
 * Creates a new review for a service, submitted by a CLIENT.
 *
 * Guards:
 *  - Service must exist (404)
 *  - Client can only review a service once (409)
 *  - Rating must be 1–5 inclusive (400)
 *
 * @param {string} clientId
 * @param {{ serviceId: string, rating: number, comment?: string }} data
 * @returns {object} Created review with client name and avatar
 */
export const createReview = async (clientId, data) => {
  const { serviceId, rating, comment } = data;

  // 1. Verify service exists
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Validate rating range before hitting the database
  if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {
    const error = new Error('Rating must be a whole number between 1 and 5');
    error.statusCode = 400;
    throw error;
  }

  // 3. Compound uniqueness check — one review per client per service
  const existing = await prisma.review.findFirst({
    where: { clientId, serviceId },
  });
  if (existing) {
    const error = new Error('You have already reviewed this service');
    error.statusCode = 409;
    throw error;
  }

  // 4. Persist and return with client details
  const review = await prisma.review.create({
    data: {
      clientId,
      serviceId,
      rating: Number(rating),
      comment: comment ?? null,
    },
    include: {
      client: { select: CLIENT_SAFE_SELECT },
    },
  });

  return review;
};

/**
 * Returns all reviews for a service together with aggregate stats.
 * Average rating is rounded to 1 decimal place (e.g. 4.3, not 4.333…).
 * Throws 404 if the service doesn't exist.
 *
 * @param {string} serviceId
 * @returns {{ reviews: object[], totalReviews: number, averageRating: number }}
 */
export const getReviewsByService = async (serviceId) => {
  // 1. Verify service exists
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Fetch all reviews for this service
  const reviews = await prisma.review.findMany({
    where: { serviceId },
    include: {
      client: { select: CLIENT_SAFE_SELECT },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalReviews = reviews.length;

  // 3. Calculate average rating in the service layer — never the controller
  const averageRating =
    totalReviews === 0
      ? 0
      : Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
        ) / 10;

  return { reviews, totalReviews, averageRating };
};

/**
 * Deletes a review. Only the client who wrote it may delete it.
 * Throws 404 if not found, 403 if the clientId doesn't match.
 *
 * @param {string} reviewId
 * @param {string} clientId
 * @returns {object} Deleted review record
 */
export const deleteReview = async (reviewId, clientId) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) {
    const error = new Error('Review not found');
    error.statusCode = 404;
    throw error;
  }

  if (review.clientId !== clientId) {
    const error = new Error('You are not authorized to delete this review');
    error.statusCode = 403;
    throw error;
  }

  return prisma.review.delete({ where: { id: reviewId } });
};
