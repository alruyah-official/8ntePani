import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  startConversation,
  getMyConversations,
  getConversationById,
  sendMessage,
} from '../controllers/conversation.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { startConversationSchema, sendMessageSchema } from '../validators/conversation.validator.js';

const router = Router();

// POST /api/conversations
// Both CLIENT and FREELANCER may initiate a conversation (e.g. freelancer applying to a job)
router.post('/', validate(startConversationSchema), protect, startConversation);

// GET  /api/conversations
// Any authenticated user fetches their own inbox
router.get('/', protect, getMyConversations);

// GET  /api/conversations/:conversationId
// Any authenticated participant may read the full thread
router.get('/:conversationId', protect, getConversationById);

// POST /api/conversations/:conversationId/messages
// Both CLIENT and FREELANCER may send messages — no role restriction here,
// the service layer enforces participant-only access
router.post('/:conversationId/messages', validate(sendMessageSchema), protect, sendMessage);

export default router;
