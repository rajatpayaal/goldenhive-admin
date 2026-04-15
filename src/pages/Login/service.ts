import api from '../../services/apiService'
import { API_ENDPOINTS } from '../../services/api.endpoints'
import { loginAdmin } from '../../services/api.service'

export type LoginPayload = {
  email: string
  password: string
}

export const loginWithEmail = async (email: string, password: string) => {
  try {
    return await loginAdmin(email, password)
  } catch {
    return api.post(API_ENDPOINTS.auth.login, { email, password })
  }
}
