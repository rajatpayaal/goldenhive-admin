import {
  createUser,
  deleteUserById,
  listUsers,
  updateUserById,
  UserPayload,
} from '../../services/adminPanel.service'
import { fetchUserById } from '../../services/apiRequests'

export type UserRole = 'USER' | 'ADMIN' | 'SALES_AGENT'

export type UserFormData = UserPayload & {
  password: string
}

export const getUsers = (params?: Record<string, unknown>) => listUsers(params)
export const getUserById = (id: string) => fetchUserById(id)
export const createUserRecord = (payload: UserFormData) => createUser(payload)
export const updateUserRecord = (id: string, payload: Partial<UserPayload>) => updateUserById(id, payload)
export const removeUserRecord = (id: string) => deleteUserById(id)
