import React, { useEffect, useState } from 'react'
import { fetchNotifications, markNotiRead, markAllNotiRead } from '../services/api.service'
import { PageHeader, Spinner } from '../components/ui'
import toast from 'react-hot-toast'
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

const typeIcon: Record<string, React.ReactNode> = {
  INFO:    <Info className="w-4 h-4 text-blue-400" />,
  WARNING: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  SUCCESS: <CheckCircle className="w-4 h-4 text-emerald-400" />,
}

const NotificationsPage: React.FC = () => {
  const [notis, setNotis]        = useState<any[]>([])
  const [loading, setLoading]    = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const load = () => {
    setLoading(true)
    fetchNotifications({ limit: 50 })
      .then(r => setNotis(r.data?.data?.items || r.data?.data || r.data?.items || []))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleMarkRead = async (id: string) => {
    try { await markNotiRead(id); load() }
    catch { toast.error('Failed') }
  }

  const handleMarkAll = async () => {
    setMarkingAll(true)
    try { await markAllNotiRead(); toast.success('All marked as read'); load() }
    catch { toast.error('Failed') }
    finally { setMarkingAll(false) }
  }

  const unread = notis.filter(n => !n.isRead).length

  return (
    <div className="page">
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread notification${unread !== 1 ? 's' : ''}`}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Notifications' }]}
        action={
          unread > 0 ? (
            <button onClick={handleMarkAll} disabled={markingAll} className="btn-secondary">
              {markingAll ? <Spinner size="sm" /> : <><CheckCheck className="w-4 h-4" /> Mark all read</>}
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : notis.length === 0 ? (
        <div className="card p-16 text-center">
          <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notis.map((n) => (
            <div
              key={n._id}
              className={`card px-5 py-4 flex items-start gap-4 transition-all duration-200
                          ${!n.isRead ? 'border-l-2 border-l-brand-500' : 'opacity-60'}`}
            >
              <div className="mt-0.5 shrink-0">
                {typeIcon[n.type] || <Bell className="w-4 h-4 text-slate-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.isRead ? 'text-slate-400' : 'text-slate-100 font-medium'}`}>{n.message}</p>
                <p className="text-xs text-slate-500 mt-1">{format(new Date(n.createdAt), 'dd MMM yyyy, HH:mm')}</p>
              </div>
              {!n.isRead && (
                <button onClick={() => handleMarkRead(n._id)} className="btn-ghost btn-sm text-xs shrink-0">
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
