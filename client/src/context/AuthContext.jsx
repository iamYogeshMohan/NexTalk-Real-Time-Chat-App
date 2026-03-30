import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nextalk_token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('nextalk_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        setToken(savedToken);
      } catch {
        localStorage.removeItem('nextalk_token');
        localStorage.removeItem('nextalk_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback((data) => {
    const { token, user } = data;
    localStorage.setItem('nextalk_token', token);
    localStorage.setItem('nextalk_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    // Clear state and storage immediately
    localStorage.removeItem('nextalk_token');
    localStorage.removeItem('nextalk_user');
    setToken(null);
    setUser(null);

    // Force a full page reload to the login page to fully clear state
    window.location.href = '/login';

    try {
      // Background request to server
      api.post('/auth/logout').catch(() => {});
    } catch (err) {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
