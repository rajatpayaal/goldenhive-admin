import { create } from 'zustand'
import api from '../services/apiService'
import { API_ENDPOINTS } from '../services/api.endpoints'
import { loginWithEmail } from '../pages/Login/service'

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
      const res = await loginWithEmail(email, password)
      const payload = res.data?.data || res.data
      const token = payload?.token
      const user = payload?.user || payload
      if (!token) throw new Error('Login response did not include a token')
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
