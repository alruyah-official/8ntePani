import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { usersApi } from '../api/users';
import { useAuth } from '../context';

export const useProfile = (username) => {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => usersApi.fetchProfile(username),
    enabled: !!username,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  
  return useMutation({
    mutationFn: (data) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Refresh the query cache
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Update global context so the UI (navbar, etc) updates instantly
      if (updatedUser) {
        updateUser(updatedUser);
      }
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });
};

export const useSellerStats = () => {
  return useQuery({
    queryKey: ['sellerStats'],
    queryFn: () => usersApi.fetchSellerStats(),
  });
};
