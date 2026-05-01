import apiClient from './client';

export const usersApi = {
  fetchProfile: async (username) => {
    return await apiClient.get(`/users/${username}`);
  },
  
  updateProfile: async (data) => {
    return await apiClient.put('/users/me', data);
  },
  
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Explicitly set multipart/form-data for the file upload
    return await apiClient.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  fetchSellerStats: async () => {
    return await apiClient.get('/users/me/stats');
  }
};
