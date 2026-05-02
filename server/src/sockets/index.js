const jwt = require('jsonwebtoken');
const Conversation = require('../models/conversation');
const Message = require('../models/message');
const messageService = require('../services/message');

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);

    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('send_message', async (data) => {
      const { conversationId, text, attachments } = data;
      const conversation = await Conversation.findById(conversationId).exec();
      if (!conversation || !conversation.participantIds.includes(socket.userId)) {
        return;
      }
      const messageData = {
        conversationId,
        senderId: socket.userId,
        text,
        attachments: attachments || []
      };
      const message = await messageService.createMessage(messageData);
      const messageWithSender = await Message.findById(message._id)
        .populate('senderId', 'id name')
        .exec();
      io.to(conversationId).emit('new_message', {
        type: 'message',
        conversationId,
        text,
        sender: messageWithSender.senderId
      });
    });

    socket.on('typing_start', (conversationId) => {
      socket.to(conversationId).emit('typing', { userId: socket.userId });
    });

    socket.on('typing_stop', (conversationId) => {
      socket.to(conversationId).emit('stopped_typing', { userId: socket.userId });
    });

    socket.on('mark_read', async (conversationId) => {
      await messageService.markAsRead(conversationId, socket.userId);
      socket.to(conversationId).emit('message_read', { conversationId, userId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
    });
  });
};