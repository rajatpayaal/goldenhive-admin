import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { AlertTriangle, Bell, CheckCheck, CheckCircle, Info } from 'lucide-react'
import { PageHeader, Spinner } from '../../components/ui'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from './service'

const typeIcon: Record<string, React.ReactNode> = {
  INFO: <Info className="h-4 w-4 text-blue-400" />,
  WARNING: <AlertTriangle className="h-4 w-4 text-warning-400" />,
  SUCCESS: <CheckCircle className="h-4 w-4 text-success-400" />,
}

const NotificationsPage: React.FC = () => {
  const [notis, setNotis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const load = () => {
    setLoading(true)
    getNotifications({ limit: 50 })
      .then((res) => setNotis(res.data?.data?.items || res.data?.data || res.data?.items || []))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      load()
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAll = async () => {
    setMarkingAll(true)
    try {
      await markAllNotificationsRead()
      toast.success('All marked as read')
      load()
    } catch {
      toast.error('Failed to mark all as read')
    } finally {
      setMarkingAll(false)
    }
  }

  const unread = notis.filter((n) => !n.isRead).length

  return (
    <div className="page">
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread notification${unread !== 1 ? 's' : ''}`}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Notifications' }]}
        action={
          unread > 0 ? (
            <button onClick={handleMarkAll} disabled={markingAll} className="btn-secondary">
              {markingAll ? <Spinner size="sm" /> : <><CheckCheck className="h-4 w-4" /> Mark all read</>}
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : notis.length === 0 ? (
        <div className="card p-16 text-center">
          <Bell className="mx-auto mb-3 h-12 w-12 text-text-tertiary" />
          <p className="text-text-tertiary">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notis.map((n) => (
            <div
              key={n._id}
              className={`card flex items-start gap-4 px-5 py-4 transition-all duration-200 ${!n.isRead ? 'border-l-2 border-l-brand-500' : 'opacity-60'}`}
            >
              <div className="mt-0.5 shrink-0">{typeIcon[n.type] || <Bell className="h-4 w-4 text-text-tertiary" />}</div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${n.isRead ? 'text-text-tertiary' : 'font-medium text-text-primary'}`}>{n.message}</p>
                <p className="mt-1 text-xs text-text-tertiary">
                  {n.createdAt ? format(new Date(n.createdAt), 'dd MMM yyyy, HH:mm') : '—'}
                </p>
              </div>
              {!n.isRead && (
                <button onClick={() => handleMarkRead(n._id)} className="btn-ghost btn-sm shrink-0 text-xs">
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
