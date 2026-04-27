import axios from 'axios'

const normalizeBaseUrl = (rawBaseUrl?: string) => {
  const value = rawBaseUrl?.trim()

  if (!value) return '/api'
  if (value === '/api' || value.endsWith('/api')) return value

  return `${value.replace(/\/+$/, '')}/api`
}

const BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL)

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gh_admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gh_admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

