import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import {
  createReview,
  getReviewsByService,
  deleteReview,
} from '../controllers/review.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createReviewSchema } from '../validators/review.validator.js';

const router = Router();

// POST   /api/reviews                        → CLIENT submits a review
router.post('/', validate(createReviewSchema), protect, restrictTo('CLIENT'), createReview);

// GET    /api/reviews/service/:serviceId     → public list of reviews for a service
// NOTE: declared before /:reviewId so "service" is not matched as a reviewId
router.get('/service/:serviceId', getReviewsByService);

// DELETE /api/reviews/:reviewId              → CLIENT deletes their own review
router.delete('/:reviewId', protect, restrictTo('CLIENT'), deleteReview);

export default router;
