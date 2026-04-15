import React from 'react'

interface BadgeProps {
  status: string
  type?: 'booking' | 'payment' | 'package' | 'user' | 'generic'
}

const bookingColors: Record<string, string> = {
  REQUESTED:   'badge-warning',
  CONTACTED:   'badge-info',
  NEGOTIATING: 'badge-warning',
  APPROVED:    'badge-success',
  REJECTED:    'badge-danger',
}

const paymentColors: Record<string, string> = {
  PAID:   'badge-success',
  UNPAID: 'badge-danger',
}

const packageColors: Record<string, string> = {
  ACTIVE:   'badge-success',
  INACTIVE: 'badge-danger',
  DRAFT:    'badge-warning',
  ARCHIVED: 'badge-default',
}

const userColors: Record<string, string> = {
  USER:  'badge-default',
  ADMIN: 'badge-info',
}

const StatusBadge: React.FC<BadgeProps> = ({ status, type = 'generic' }) => {
  let colorClass = 'badge-default'

  if (type === 'booking')  colorClass = bookingColors[status]  || 'badge-default'
  if (type === 'payment')  colorClass = paymentColors[status]  || 'badge-default'
  if (type === 'package')  colorClass = packageColors[status]  || 'badge-default'
  if (type === 'user')     colorClass = userColors[status]     || 'badge-default'

  return <span className={`badge ${colorClass}`}>{status}</span>
}

export default StatusBadge
