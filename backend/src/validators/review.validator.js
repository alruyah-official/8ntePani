import { z } from 'zod';

/**
 * Schema for creating a review.
 */
export const createReviewSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  rating: z.number().int('Rating must be an integer').min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(1000, 'Comment cannot exceed 1000 characters').optional(),
});
