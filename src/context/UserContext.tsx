import React, { createContext, useContext, useMemo } from 'react'
import { type AuthUser, useAuthStore } from '../store/authStore'

interface UserContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  logout: () => void
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      logout,
    }),
    [user, token, logout]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider')
  }
  return context
}
