import { z } from 'zod';

/**
 * Schema for creating a new order.
 */
export const createOrderSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  requirements: z
    .string()
    .min(10, 'Requirements must be at least 10 characters long')
    .max(2000, 'Requirements cannot exceed 2000 characters'),
});

/**
 * Schema for delivering an order with a note.
 */
export const deliverOrderSchema = z.object({
  deliveryNote: z
    .string()
    .min(1, 'Delivery note is required')
    .max(2000, 'Delivery note cannot exceed 2000 characters'),
});
