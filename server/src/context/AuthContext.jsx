import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authStore from '../utils/authStore';

const AuthContext = createContext(null);

const TOKEN_KEY = 'skillhive_token';
const REFRESH_TOKEN_KEY = 'skillhive_refresh_token';
const USER_KEY = 'skillhive_user';

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore session on app load ───────────────────────────────────────────
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      // Dev bypass removed — users must log in through the real /api/auth/login endpoint
    } catch (err) {
      // Corrupted localStorage — clear everything
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Sync logout across browser tabs ──────────────────────────────────────
  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === TOKEN_KEY && !e.newValue) {
        // Token was removed in another tab → log out here too
        setUser(null);
        setToken(null);
        navigate('/login');
      }
      if (e.key === TOKEN_KEY && e.newValue && !token) {
        // Logged in from another tab → restore session
        try {
          const u = localStorage.getItem(USER_KEY);
          if (u) {
            setUser(JSON.parse(u));
            setToken(e.newValue);
          }
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate, token]);

  // ── Register logout in authStore so Axios interceptors can call it ────────
  useEffect(() => {
    authStore.logout = logout;
    authStore.navigate = navigate;
  });

  // ── login ─────────────────────────────────────────────────────────────────
  /**
   * Called after a successful /auth/login or /auth/signup response.
   * @param {string}  newToken         - JWT access token
   * @param {object}  newUser          - Safe user object (no password)
   * @param {string} [newRefreshToken] - JWT refresh token (optional)
   */
  const login = useCallback((newToken, newUser, newRefreshToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    if (newRefreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    }
    setToken(newToken);
    setUser(newUser);
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // ── updateUser (for profile edits) ───────────────────────────────────────
  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this everywhere instead of useContext directly
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}