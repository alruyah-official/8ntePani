import { z } from 'zod';

/**
 * Schema for creating a freelancer profile.
 */
export const createProfileSchema = z.object({
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  location: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

/**
 * Schema for updating a freelancer profile (all fields optional).
 */
export const updateProfileSchema = createProfileSchema.partial();
