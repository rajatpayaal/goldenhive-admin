import { fetchDashboard } from '../../services/api.service'

export const getDashboard = (params?: { days?: number; recentLimit?: number; topLimit?: number }) =>
  fetchDashboard(params)
