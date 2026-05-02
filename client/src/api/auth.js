import apiClient from './client';

export const authApi = {
  /**
   * POST /auth/login
   * Returns { token, refreshToken, user, message }
   */
  login: async ({ email, password }) => {
    return await apiClient.post('/auth/login', { email, password });
  },

  /**
   * POST /auth/signup
   * Returns { token, refreshToken, user, message }
   */
  signup: async ({ name, email, password, role, username }) => {
    const normalizedUsername = username || email.split('@')[0].replace(/[^\w-]/g, '');
    return await apiClient.post('/auth/signup', {
      name,
      email,
      password,
      role,
      username: normalizedUsername,
    });
  },

  /**
   * POST /auth/refresh
   * Body: { refreshToken }
   * Returns { token, refreshToken, message }
   */
  refresh: async ({ refreshToken }) => {
    return await apiClient.post('/auth/refresh', { refreshToken });
  },

  /**
   * POST /auth/logout  (protected)
   */
  logout: async () => {
    return await apiClient.post('/auth/logout');
  },

  /**
   * GET /auth/me  (protected)
   * Returns { user, message }
   */
  getMe: async () => {
    return await apiClient.get('/auth/me');
  },

  /**
   * PUT /auth/password  (protected)
   */
  updatePassword: async ({ currentPassword, newPassword }) => {
    return await apiClient.put('/auth/password', { currentPassword, newPassword });
  },

  /**
   * POST /auth/forgot-password
   */
  forgotPassword: async ({ email }) => {
    return await apiClient.post('/auth/forgot-password', { email });
  },
};
