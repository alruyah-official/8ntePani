import { z } from 'zod';

/**
 * Schema for creating a job posting. Enforces title length, description
 * minimum, required categoryId, and an optional positive budget.
 */
export const createJobSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  categoryId: z.string().min(1, 'Category ID is required'),
  budget: z.number().positive('Budget must be positive').optional(),
});

/**
 * Schema for updating a job posting (all fields optional).
 */
export const updateJobSchema = createJobSchema.partial();

/**
 * Schema for updating job status — only accepts valid JobStatus enum values.
 */
export const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED'], {
    errorMap: () => ({ message: 'Status must be OPEN, IN_PROGRESS, or COMPLETED' }),
  }),
});
