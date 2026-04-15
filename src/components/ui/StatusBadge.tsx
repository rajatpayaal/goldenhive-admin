import React from 'react'

interface BadgeProps {
  status: string
  type?: 'booking' | 'payment' | 'package' | 'user' | 'generic'
}

const bookingColors: Record<string, string> = {
  REQUESTED:   'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 ring-warning-500/30',
  CONTACTED:   'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 ring-primary-500/30',
  NEGOTIATING: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 ring-warning-500/30',
  APPROVED:    'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 ring-success-500/30',
  REJECTED:    'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 ring-danger-500/30',
}

const paymentColors: Record<string, string> = {
  PAID:   'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 ring-success-500/30',
  UNPAID: 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 ring-danger-500/30',
}

const packageColors: Record<string, string> = {
  ACTIVE:   'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 ring-success-500/30',
  INACTIVE: 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 ring-danger-500/30',
  DRAFT:    'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 ring-warning-500/30',
  ARCHIVED: 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 ring-slate-500/30',
}

const userColors: Record<string, string> = {
  USER:  'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 ring-slate-500/30',
  ADMIN: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 ring-primary-500/30',
}

const StatusBadge: React.FC<BadgeProps> = ({ status, type = 'generic' }) => {
  let colorClass = 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 ring-slate-500/30'

  if (type === 'booking')  colorClass = bookingColors[status]  || colorClass
  if (type === 'payment')  colorClass = paymentColors[status]  || colorClass
  if (type === 'package')  colorClass = packageColors[status]  || colorClass
  if (type === 'user')     colorClass = userColors[status]     || colorClass

  return (
    <span className={`inline-flex rounded-full border border-current/20 px-3 py-1 text-xs font-semibold tracking-wider ring-1 ${colorClass}`}>
      {status}
    </span>
  )
}

export default StatusBadge
