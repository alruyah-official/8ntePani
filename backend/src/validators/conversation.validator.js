import { z } from 'zod';

/**
 * Schema for starting a conversation.
 */
export const startConversationSchema = z.object({
  freelancerId: z.string().min(1, 'Freelancer ID is required'),
});

/**
 * Schema for sending a message.
 */
export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content cannot exceed 2000 characters'),
});
