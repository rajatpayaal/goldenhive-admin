import { fetchNotifications, markAllNotiRead, markNotiRead } from '../../services/api.service'

export const getNotifications = (params?: Record<string, unknown>) => fetchNotifications(params)
export const markNotificationRead = (id: string) => markNotiRead(id)
export const markAllNotificationsRead = () => markAllNotiRead()
