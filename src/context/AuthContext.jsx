import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/endpoints';

const AuthContext = createContext(null);
const AUTH_API_BASE = '/auth';

const extractAuthData = (response) => {
  const root = response?.data ?? {};
  const data = root.data ?? root;
  const token = data.token ?? data.accessToken ?? data.jwt ?? root.token ?? root.accessToken ?? root.jwt ?? null;
  const user = data.user ?? root.user ?? data.profile ?? root.profile ?? null;
  const role = (user?.role ?? data.role ?? root.role ?? '').toString().toUpperCase();

  return { token, user, role, raw: response?.data };
};

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
      // Try the v2 auth first
      console.log('[Auth API]', {
        method: 'POST',
        endpoint: `${AUTH_API_BASE}/login`,
        action: 'primary-login',
        email,
      });
      const res = await authAPI.login({ email, password });
      const { token: jwt, user: userData, role, raw } = extractAuthData(res);
      console.log('[Auth API] primary login response', {
        hasToken: !!jwt,
        hasUser: !!userData,
        role,
        responseKeys: Object.keys(raw || {}),
      });
      if (!jwt) {
        throw new Error('Token not found in login response.');
      }
      if (!userData) {
        throw new Error('User data not found in login response.');
      }
      if (role !== 'ADMIN' && role !== 'SALES_AGENT') {
        throw new Error('Access denied. Admin or Sales Agent role required.');
      }
      localStorage.setItem('gh_token', jwt);
      localStorage.setItem('gh_user', JSON.stringify(userData));
      setToken(jwt);
      setUser(userData);
      console.log('[Auth API] primary login success', { role });
      return { success: true };
    } catch (err) {
      console.warn('[Auth API] primary login failed, trying fallback', {
        endpointTried: `${AUTH_API_BASE}/login`,
        error: err?.response?.data?.error || err.message,
      });
      // Fallback to legacy admin login
      try {
        console.log('[Auth API]', {
          method: 'POST',
          endpoint: '/admin/login',
          action: 'fallback-admin-login',
          email,
        });
        const res = await authAPI.adminLogin({ email, password });
        const { token: jwt, user: userDataFromResponse, role, raw } = extractAuthData(res);
        const userEmail = userDataFromResponse?.email ?? raw?.data?.email ?? raw?.email ?? email;
        const normalizedRole = (role || '').toUpperCase();
        console.log('[Auth API] fallback login response', {
          hasToken: !!jwt,
          hasUser: !!userDataFromResponse,
          role: normalizedRole,
          responseKeys: Object.keys(raw || {}),
        });
        if (!jwt) {
          throw new Error('Token not found in admin login response.');
        }
        if (normalizedRole !== 'ADMIN' && normalizedRole !== 'SALES_AGENT') {
          throw new Error('Access denied.');
        }
        const userData = { email: userEmail, role: normalizedRole };
        localStorage.setItem('gh_token', jwt);
        localStorage.setItem('gh_user', JSON.stringify(userData));
        setToken(jwt);
        setUser(userData);
        console.log('[Auth API] fallback admin login success', { role: normalizedRole });
        return { success: true };
      } catch (fallbackErr) {
        console.error('[Auth API] fallback admin login failed', {
          endpointTried: '/admin/login',
          error: fallbackErr?.response?.data?.error || fallbackErr.message,
        });
        const msg = fallbackErr?.response?.data?.error || err?.response?.data?.error || err.message || 'Login failed';
        return { success: false, error: msg };
      }
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
