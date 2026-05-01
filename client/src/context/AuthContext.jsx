import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authStore from '../utils/authStore';

const AuthContext = createContext(null);

const TOKEN_KEY = 'skillhive_token';
const USER_KEY = 'skillhive_user';

// ── Dev mock user ────────────────────────────────────────
const DEV_USER = {
  id: 'dev-user-1',
  name: 'Arjun Kumar',
  email: 'arjun@dev.com',
  username: 'arjunkumar',
  role: 'seller',
  avatar: 'https://ui-avatars.com/api/?name=Arjun+Kumar&background=111111&color=C8F135&size=64',
  sellerLevel: 'top',
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore session on app load ──────────────────────
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else if (import.meta.env.DEV) {
        // Dev bypass — auto login in development only
        localStorage.setItem(TOKEN_KEY, 'dev-token');
        localStorage.setItem(USER_KEY, JSON.stringify(DEV_USER));
        setToken('dev-token');
        setUser(DEV_USER);
      }
    } catch (err) {
      // Corrupted localStorage — clear it
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Sync logout across browser tabs ─────────────────
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
          if (u) { setUser(JSON.parse(u)); setToken(e.newValue); }
        } catch { }
      }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate, token]);

  // ── Register functions in authStore for Axios ────────
  useEffect(() => {
    authStore.logout = logout;
    authStore.navigate = navigate;
  });

  // ── login ────────────────────────────────────────────
  const login = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  // ── logout ───────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // ── updateUser (for profile edits) ───────────────────
  const updateUser = useCallback((updatedFields) => {
    setUser(prev => {
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
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}