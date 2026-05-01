import apiClient from './client';

export const messagesApi = {
  fetchConversations: async () => {
    return await apiClient.get('/messages/conversations');
  },
  
  fetchMessages: async (conversationId) => {
    return await apiClient.get(`/messages/${conversationId}`);
  },
  
  sendMessage: async ({ conversationId, text, attachments }) => {
    return await apiClient.post('/messages', { conversationId, text, attachments });
  },
  
  startConversation: async ({ recipientId, gigId, text }) => {
    return await apiClient.post('/messages/conversations', { recipientId, gigId, text });
  },
  
  markAsRead: async (conversationId) => {
    return await apiClient.patch(`/messages/${conversationId}/read`);
  }
};
