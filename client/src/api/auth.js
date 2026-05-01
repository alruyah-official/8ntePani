import apiClient from './client';

export const authApi = {
  login: async ({ email, password }) => {
    return await apiClient.post('/auth/login', { email, password });
  },
  signup: async ({ name, email, password, role, username }) => {
    const normalizedUsername = username || email.split('@')[0].replace(/[^\w-]/g, '');
    return await apiClient.post('/auth/signup', { name, email, password, role, username: normalizedUsername });
  },
  logout: async () => {
    return await apiClient.post('/auth/logout');
  },
  getMe: async () => {
    return await apiClient.get('/auth/me');
  },
  updatePassword: async ({ currentPassword, newPassword }) => {
    return await apiClient.put('/auth/password', { currentPassword, newPassword });
  },
  forgotPassword: async ({ email }) => {
    return await apiClient.post('/auth/forgot-password', { email });
  }
};
