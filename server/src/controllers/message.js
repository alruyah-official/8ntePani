const messageService = require('../services/message');
const prisma = require('../config/database');

const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await messageService.findConversations(req.user.id, parseInt(page), parseInt(limit));
    res.json({ data: result.conversations, total: result.total, page: result.page, limit: result.limit, message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createConversation = async (req, res) => {
  try {
    const { gigId, participantId } = req.body;
    const existing = await prisma.conversation.findFirst({
      where: {
        gigId,
        participantIds: { hasEvery: [req.user.id, participantId] }
      }
    });
    if (existing) {
      return res.json({ data: existing, message: 'Conversation already exists' });
    }
    const data = {
      participantIds: [req.user.id, participantId],
      gigId,
    };
    const conversation = await messageService.createConversation(data);
    res.status(201).json({ data: conversation, message: 'Conversation created' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const conversation = await messageService.findConversationById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participantIds.includes(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json({ data: conversation.messages, message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, attachments } = req.body;
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participantIds.includes(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const data = {
      conversationId,
      senderId: req.user.id,
      text,
      attachments: attachments || []
    };
    const message = await messageService.createMessage(data);
    res.status(201).json({ data: message, message: 'Message sent' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const markRead = async (req, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({ where: { id: req.params.conversationId } });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participantIds.includes(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await messageService.markAsRead(req.params.conversationId, req.user.id);
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markRead,
};