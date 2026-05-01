import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '../api/messages';

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesApi.fetchConversations(),
    refetchInterval: 10000, // 10-second polling fallback alongside WebSockets
  });
};

export const useMessages = (conversationId) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messagesApi.fetchMessages(conversationId),
    enabled: !!conversationId, // Only fetch if we have an active conversation selected
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => messagesApi.sendMessage(data),
    onSuccess: (_, variables) => {
      // Invalidate both the active thread and the master conversation list
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useStartConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => messagesApi.startConversation(data),
    onSuccess: () => {
      // Refresh the master list when a new conversation is initiated
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
