import { z } from 'zod';

/**
 * Schema for creating a service.
 */
export const createServiceSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().positive('Price must be positive').gt(0, 'Price must be greater than 0'),
  deliveryDays: z.number().int('Delivery days must be an integer').min(1, 'Delivery days must be at least 1').max(30, 'Delivery days cannot exceed 30'),
  categoryId: z.string().min(1, 'Category ID is required'),
  images: z.array(z.string()).optional(),
});

/**
 * Schema for updating a service (all fields optional).
 */
export const updateServiceSchema = createServiceSchema.partial();
