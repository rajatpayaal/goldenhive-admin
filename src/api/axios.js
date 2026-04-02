import axios from 'axios';

const DEFAULT_API_URL = 'https://goldenhive-backend-g1xv.onrender.com/api';

const normalizeApiBase = (url) => {
  if (!url) return DEFAULT_API_URL;
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

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
