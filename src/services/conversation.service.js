import prisma from '../config/prisma.js';

// Safe user fields — password always omitted
const USER_SAFE_SELECT = {
  id: true,
  name: true,
  avatar: true,
};

/**
 * Starts a conversation between a CLIENT and a FREELANCER.
 * If a conversation already exists between the pair, it is returned instead
 * of creating a duplicate — callers can distinguish via the isNew flag.
 *
 * Guards:
 *  - freelancerId must belong to a user with role FREELANCER (400)
 *  - clientId and freelancerId cannot be the same user (400)
 *
 * @param {string} clientId
 * @param {string} freelancerId
 * @returns {{ conversation: object, isNew: boolean }}
 */
export const startConversation = async (clientId, freelancerId) => {
  // 1. Sanity check — a user cannot message themselves
  if (clientId === freelancerId) {
    const error = new Error('You cannot start a conversation with yourself');
    error.statusCode = 400;
    throw error;
  }

  // 2. Verify the target user actually has the FREELANCER role
  const freelancer = await prisma.user.findUnique({
    where: { id: freelancerId },
    select: { id: true, role: true },
  });

  if (!freelancer || freelancer.role !== 'FREELANCER') {
    const error = new Error('The specified user is not a freelancer');
    error.statusCode = 400;
    throw error;
  }

  // 3. Check for an existing conversation between this exact pair
  const existing = await prisma.conversation.findFirst({
    where: { clientId, freelancerId },
    include: {
      client:     { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
    },
  });

  if (existing) {
    return { conversation: existing, isNew: false };
  }

  // 4. No conversation yet — create one
  const conversation = await prisma.conversation.create({
    data: { clientId, freelancerId },
    include: {
      client:     { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
    },
  });

  return { conversation, isNew: true };
};

/**
 * Returns all conversations the user participates in (as either
 * CLIENT or FREELANCER), with a preview of the last message in each.
 * Results are ordered newest-first.
 *
 * @param {string} userId
 * @returns {object[]} Conversations with client, freelancer, and lastMessage
 */
export const getMyConversations = async (userId) => {
  return prisma.conversation.findMany({
    where: {
      OR: [{ clientId: userId }, { freelancerId: userId }],
    },
    include: {
      client:     { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      // Preview: only the single most recent message
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: { select: USER_SAFE_SELECT },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Returns a single conversation with its full message thread.
 * Only participants (client or freelancer) may access it.
 *
 * Guards:
 *  - Conversation must exist (404)
 *  - Requesting userId must be a participant (403)
 *
 * @param {string} conversationId
 * @param {string} userId
 * @returns {object} Full conversation with all messages and participant details
 */
export const getConversationById = async (conversationId, userId) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      client:     { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: USER_SAFE_SELECT },
        },
      },
    },
  });

  if (!conversation) {
    const error = new Error('Conversation not found');
    error.statusCode = 404;
    throw error;
  }

  const isParticipant =
    conversation.clientId === userId || conversation.freelancerId === userId;

  if (!isParticipant) {
    const error = new Error('You are not a participant in this conversation');
    error.statusCode = 403;
    throw error;
  }

  return conversation;
};

/**
 * Sends a message inside an existing conversation.
 * Only the two participants may send messages.
 *
 * Guards:
 *  - Conversation must exist (404)
 *  - Sender must be a participant (403)
 *  - Content must be non-empty (400)
 *
 * @param {string} conversationId
 * @param {string} senderId
 * @param {string} content
 * @returns {object} Created message with sender details
 */
export const sendMessage = async (conversationId, senderId, content) => {
  // 1. Validate content before any DB call
  if (!content || content.trim() === '') {
    const error = new Error('Message content cannot be empty');
    error.statusCode = 400;
    throw error;
  }

  // 2. Verify conversation exists
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    const error = new Error('Conversation not found');
    error.statusCode = 404;
    throw error;
  }

  // 3. Only participants may post messages
  const isParticipant =
    conversation.clientId === senderId || conversation.freelancerId === senderId;

  if (!isParticipant) {
    const error = new Error('You are not a participant in this conversation');
    error.statusCode = 403;
    throw error;
  }

  // 4. Persist and return with sender details
  return prisma.message.create({
    data: {
      conversationId,
      senderId,
      content: content.trim(),
    },
    include: {
      sender: { select: USER_SAFE_SELECT },
    },
  });
};
