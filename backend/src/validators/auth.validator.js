import { z } from 'zod';

/**
 * Registration validation schema.
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CLIENT', 'FREELANCER'], { errorMap: () => ({ message: 'Role must be CLIENT or FREELANCER' }) }),
});

/**
 * Login validation schema.
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
