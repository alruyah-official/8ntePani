import {
  createReview as createReviewService,
  getReviewsByService as getReviewsByServiceFn,
  deleteReview as deleteReviewService,
} from '../services/review.service.js';

/**
 * POST /api/reviews
 * Creates a review on a service. Protected: CLIENT only.
 * Expects: { serviceId, rating, comment? } in req.body
 */
export const createReview = async (req, res) => {
  try {
    const clientId = req.user.id;
    const review = await createReviewService(clientId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to submit review',
      error: error.message,
    });
  }
};

/**
 * GET /api/reviews/service/:serviceId
 * Returns all reviews for a service with aggregate stats. Public.
 */
export const getReviewsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { reviews, totalReviews, averageRating } =
      await getReviewsByServiceFn(serviceId);

    return res.status(200).json({
      success: true,
      message: 'Reviews fetched successfully',
      data: { totalReviews, averageRating, reviews },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/reviews/:reviewId
 * Deletes a review the authenticated client owns. Protected: CLIENT only.
 */
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const clientId = req.user.id;

    await deleteReviewService(reviewId, clientId);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: null,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete review',
      error: error.message,
    });
  }
};
