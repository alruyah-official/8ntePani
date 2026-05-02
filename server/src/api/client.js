import axios from 'axios';
import authStore from '../utils/authStore';

const TOKEN_KEY = 'skillhive_token';
const REFRESH_TOKEN_KEY = 'skillhive_refresh_token';
const USER_KEY = 'skillhive_user';

// ── Axios instance ────────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3030/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ── Request interceptor — attach JWT ─────────────────────────────────────────
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

// ── Response interceptor — unwrap data + handle auth errors ──────────────────
client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const message = error.response?.data?.message || 'Something went wrong';

    // ── TOKEN_EXPIRED — attempt silent refresh ────────────────────────────────
    if (status === 401 && code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!storedRefreshToken) {
        isRefreshing = false;
        forceLogout();
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3030/api'}/auth/refresh`,
          { refreshToken: storedRefreshToken }
        );

        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem(TOKEN_KEY, newAccessToken);
        if (newRefreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(new Error('Session expired. Please log in again.'));
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401) {
      forceLogout();
      return Promise.reject(new Error('Authentication required. Please log in.'));
    }

    if (status === 422 || status === 400) {
      const errors = error.response?.data?.errors;
      const formatted = errors ? Object.values(errors).flat().join('. ') : message;
      return Promise.reject(new Error(formatted));
    }

    if (status === 403) {
      return Promise.reject(new Error('You do not have permission to do this.'));
    }

    if (status === 404) {
      return Promise.reject(new Error('The requested resource was not found.'));
    }

    if (!error.response) {
      return Promise.reject(new Error('Cannot connect to server. Is the backend running?'));
    }

    return Promise.reject(new Error(message));
  }
);

function forceLogout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  if (authStore.logout) {
    authStore.logout();
  } else {
    window.location.href = '/login';
  }
}

export { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY };
export default client;