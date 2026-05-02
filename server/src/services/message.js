const Conversation = require('../models/conversation');
const Message = require('../models/message');

const createConversation = async (data) => {
  return await Conversation.create(data);
};

const findConversationById = async (id) => {
  return await Conversation.findById(id)
    .populate({
      path: 'messages',
      options: { sort: { createdAt: 1 } },
      populate: { path: 'senderId', select: 'name avatar' }
    })
    .populate({ path: 'participantIds', select: 'name avatar' })
    .exec();
};

const findConversations = async (userId, page = 1, limit = 10) => {
  const query = { participantIds: userId };
  const total = await Conversation.countDocuments(query);
  const conversations = await Conversation.find(query)
    .populate('gig', 'title images')
    .populate({
      path: 'messages',
      options: { sort: { createdAt: -1 }, limit: 1 },
      populate: { path: 'senderId', select: 'name' }
    })
    .sort({ lastMessageAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
  return { conversations, total, page, limit };
};

const createMessage = async (data) => {
  const message = await Message.create(data);
  await Conversation.findByIdAndUpdate(data.conversationId, {
    lastMessage: data.text,
    lastMessageAt: new Date(),
  });
  return message;
};

const markAsRead = async (conversationId, userId) => {
  await Message.updateMany({
    conversationId,
    senderId: { $ne: userId },
    isRead: false
  }, { isRead: true });
};

module.exports = {
  createConversation,
  findConversationById,
  findConversations,
  createMessage,
  markAsRead,
};