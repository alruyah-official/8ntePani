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

// Track whether we are currently refreshing to avoid infinite loops
let isRefreshing = false;
// Queue requests that arrive while a refresh is in progress
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
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
  (response) => {
    // Return response.data directly so callers get the payload, not the Axios envelope
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const message = error.response?.data?.message || 'Something went wrong';

    // ── Token expired — attempt a silent refresh ──────────────────────────────
    if (status === 401 && code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request; it will be retried once the refresh completes
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
        // No refresh token — log out immediately
        isRefreshing = false;
        forceLogout();
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }

      try {
        // Call the refresh endpoint directly with a plain axios call (not our client,
        // to avoid interceptor loops)
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3030/api'}/auth/refresh`,
          { refreshToken: storedRefreshToken }
        );

        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Persist new tokens
        localStorage.setItem(TOKEN_KEY, newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }

        // Retry the failed request with the new access token
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

    // ── Hard 401 (invalid token, no refresh token, etc.) — force logout ───────
    if (status === 401) {
      forceLogout();
      return Promise.reject(new Error('Authentication required. Please log in.'));
    }

    // ── Other error codes ─────────────────────────────────────────────────────

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

/**
 * Clears all auth state and redirects to /login.
 * Calls the AuthContext logout function if available; falls back to a hard redirect.
 */
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