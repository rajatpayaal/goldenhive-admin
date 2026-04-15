import { useEffect } from 'react'
import api from '../services/apiService'
import { useAuthStore } from '../store/authStore'

const TokenHandler = () => {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    const hydrateUser = async () => {
      if (!token || user) {
        return
      }

      try {
        const response = await api.get('/auth/me')
        const payload = response.data?.data || response.data
        if (payload?.user) {
          setUser(payload.user)
        }
      } catch {
        logout()
      }
    }

    void hydrateUser()
  }, [token, user, setUser, logout])

  return null
}

export default TokenHandler
