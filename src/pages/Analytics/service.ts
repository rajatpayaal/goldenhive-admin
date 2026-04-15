import { fetchAdminAnalytics } from '../../services/adminPanel.service'

export const getAnalyticsDashboard = (days = 30) => fetchAdminAnalytics(days)
