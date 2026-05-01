import apiClient from './client';

export const ordersApi = {
  createOrder: async ({ gigId, packageType, requirements }) => {
    return await apiClient.post('/orders', { gigId, packageType, requirements });
  },
  
  fetchMyOrders: async (role) => {
    return await apiClient.get('/orders', { params: { role } });
  },
  
  fetchOrderById: async (id) => {
    return await apiClient.get(`/orders/${id}`);
  },
  
  updateOrderStatus: async (id, status) => {
    return await apiClient.patch(`/orders/${id}/status`, { status });
  },
  
  deliverOrder: async (id, { message, attachments }) => {
    return await apiClient.post(`/orders/${id}/deliver`, { message, attachments });
  },
  
  requestRevision: async (id, { message }) => {
    return await apiClient.post(`/orders/${id}/revision`, { message });
  },
  
  completeOrder: async (id) => {
    return await apiClient.post(`/orders/${id}/complete`);
  }
};
