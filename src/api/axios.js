import axios from 'axios';

const DEFAULT_API_URL = 'https://goldenhive-backend-g1xv.onrender.com/api';

const normalizeApiBase = (url) => {
  if (!url || typeof url !== 'string') return DEFAULT_API_URL;

  const candidate = url.trim();
  if (!/^https?:\/\//i.test(candidate)) return DEFAULT_API_URL;

  try {
    const parsed = new URL(candidate);
    const pathname = parsed.pathname.replace(/\/+$/, '');
    parsed.pathname = pathname.endsWith('/api') ? pathname : `${pathname}/api`;
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return DEFAULT_API_URL;
  }
};

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

if (typeof window !== 'undefined') {
  console.info('[API] base url resolved', API_BASE);
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gh_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gh_token');
      localStorage.removeItem('gh_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
