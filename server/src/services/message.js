const prisma = require('../config/database');

const createConversation = async (data) => {
  return await prisma.conversation.create({ data });
};

const findConversationById = async (id) => {
  return await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        include: { sender: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'asc' }
      },
      participants: { select: { id: true, name: true, avatar: true } }
    }
  });
};

const findConversations = async (userId, page = 1, limit = 10) => {
  const where = {
    participantIds: { has: userId }
  };
  const total = await prisma.conversation.count({ where });
  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      gig: { select: { title: true, images: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: { name: true } } }
      },
      _count: { select: { messages: true } }
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { lastMessageAt: 'desc' }
  });
  return { conversations, total, page, limit };
};

const createMessage = async (data) => {
  const message = await prisma.message.create({ data });
  await prisma.conversation.update({
    where: { id: data.conversationId },
    data: {
      lastMessage: data.text,
      lastMessageAt: new Date(),
    }
  });
  return message;
};

const markAsRead = async (conversationId, userId) => {
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false
    },
    data: { isRead: true }
  });
};

module.exports = {
  createConversation,
  findConversationById,
  findConversations,
  createMessage,
  markAsRead,
};