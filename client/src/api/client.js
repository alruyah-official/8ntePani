import axios from 'axios';
import authStore from '../utils/authStore';

const TOKEN_KEY = 'skillhive_token';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach JWT ─────────────────────
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — unwrap data + handle errors ───
client.interceptors.response.use(
  (response) => {
    // Return response.data directly so callers get
    // { data, message, total, page } not the whole Axios response
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Something went wrong';

    if (status === 401) {
      // Token expired or invalid — log out properly
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('skillhive_user');

      // Call AuthContext logout if available (clears React state too)
      if (authStore.logout) {
        authStore.logout();
      } else {
        window.location.href = '/login';
      }
    }

    if (status === 422) {
      // Validation errors — format them into a readable string
      const errors = error.response?.data?.errors;
      const formatted = errors
        ? Object.values(errors).flat().join('. ')
        : message;
      return Promise.reject(new Error(formatted));
    }

    if (status === 403) {
      return Promise.reject(new Error('You do not have permission to do this.'));
    }

    if (status === 404) {
      return Promise.reject(new Error('The requested resource was not found.'));
    }

    if (!error.response) {
      // Network error — backend is likely not running
      return Promise.reject(new Error('Cannot connect to server. Is the backend running?'));
    }

    return Promise.reject(new Error(message));
  }
);

export default client;