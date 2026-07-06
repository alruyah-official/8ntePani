import {
  startConversation as startConversationService,
  getMyConversations as getMyConversationsService,
  getConversationById as getConversationByIdService,
  sendMessage as sendMessageService,
} from '../services/conversation.service.js';

/**
 * POST /api/conversations
 * Starts a new conversation between the authenticated CLIENT and a FREELANCER.
 * Returns 201 for a newly created conversation, 200 if one already existed.
 * Expects: { freelancerId } in req.body
 */
export const startConversation = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { freelancerId } = req.body;

    const { conversation, isNew } = await startConversationService(
      clientId,
      freelancerId
    );

    const statusCode = isNew ? 201 : 200;
    const message = isNew
      ? 'Conversation started successfully'
      : 'Conversation already exists';

    return res.status(statusCode).json({
      success: true,
      message,
      data: { isNew, conversation },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to start conversation',
      error: error.message,
    });
  }
};

/**
 * GET /api/conversations
 * Returns all conversations the authenticated user participates in,
 * each with a last-message preview.
 */
export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await getMyConversationsService(userId);

    return res.status(200).json({
      success: true,
      message: 'Conversations fetched successfully',
      data: { count: conversations.length, conversations },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch conversations',
      error: error.message,
    });
  }
};

/**
 * GET /api/conversations/:conversationId
 * Returns a single conversation with its full message thread.
 * Access is restricted to the two participants.
 */
export const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await getConversationByIdService(
      conversationId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: 'Conversation fetched successfully',
      data: { conversation },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch conversation',
      error: error.message,
    });
  }
};

/**
 * POST /api/conversations/:conversationId/messages
 * Sends a message inside an existing conversation.
 * Both CLIENT and FREELANCER participants may send messages.
 * Expects: { content } in req.body
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const senderId = req.user.id;
    const { content } = req.body;

    const message = await sendMessageService(conversationId, senderId, content);

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to send message',
      error: error.message,
    });
  }
};
