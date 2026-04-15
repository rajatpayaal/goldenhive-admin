import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('gh_token');
    const savedUser = localStorage.getItem('gh_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const payload = res?.data?.data ?? {};
      const jwt = payload.token;
      const userData = {
        email: payload.email || email,
        role: (payload.role || '').toUpperCase(),
      };

      if (!jwt) {
        throw new Error('Token not found in login response.');
      }

      if (userData.role !== 'ADMIN' && userData.role !== 'SALES_AGENT') {
        throw new Error('Access denied. Admin or Sales Agent role required.');
      }
      localStorage.setItem('gh_token', jwt);
      localStorage.setItem('gh_user', JSON.stringify(userData));
      setToken(jwt);
      setUser(userData);
      console.log('[Auth API] login success', { role: userData.role });
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Login failed';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('gh_token');
    localStorage.removeItem('gh_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
