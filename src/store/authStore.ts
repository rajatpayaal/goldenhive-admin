import { create } from 'zustand'
import api from '../services/apiService'

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: AuthUser) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('gh_admin_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      let res
      try {
        res = await api.post('/auth/admin/login', { email, password })
      } catch {
        res = await api.post('/auth/login', { email, password })
      }
      const { token, user } = res.data.data || res.data
      localStorage.setItem('gh_admin_token', token)
      set({ token, user, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('gh_admin_token')
    set({ user: null, token: null })
  },

  setUser: (user) => set({ user }),
}))
