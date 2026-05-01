import apiClient from './client';

export const gigsApi = {
  fetchGigs: async (params) => {
    return await apiClient.get('/gigs', { params });
  },
  fetchGigById: async (id) => {
    return await apiClient.get(`/gigs/${id}`);
  },
  createGig: async (data) => {
    return await apiClient.post('/gigs', data);
  },
  updateGig: async (id, data) => {
    return await apiClient.put(`/gigs/${id}`, data);
  },
  deleteGig: async (id) => {
    return await apiClient.delete(`/gigs/${id}`);
  },
  fetchMyGigs: async () => {
    return await apiClient.get('/gigs/mine');
  },
  fetchGigReviews: async (id) => {
    return await apiClient.get(`/gigs/${id}/reviews`);
  }
};
