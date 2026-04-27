import { loginAdmin } from '../../services/api.service'

export type LoginPayload = {
  email: string
  password: string
}

export const loginWithEmail = async (email: string, password: string) => {
  return loginAdmin(email, password)
}
