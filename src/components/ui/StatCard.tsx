import React from 'react'
import { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  color?: 'teal' | 'blue' | 'green' | 'orange' | 'red'
  loading?: boolean
}

const colorConfig = {
  teal: {
    bg: 'bg-primary-500/10',
    border: 'border-primary-500/30',
    icon: 'text-primary-600',
    trendUp: 'text-success-600',
    trendDown: 'text-danger-600',
  },
  blue: {
    bg: 'bg-primary-500/10',
    border: 'border-primary-500/30',
    icon: 'text-primary-600',
    trendUp: 'text-success-600',
    trendDown: 'text-danger-600',
  },
  green: {
    bg: 'bg-success-500/10',
    border: 'border-success-500/30',
    icon: 'text-success-600',
    trendUp: 'text-success-600',
    trendDown: 'text-danger-600',
  },
  orange: {
    bg: 'bg-warning-500/10',
    border: 'border-warning-500/30',
    icon: 'text-warning-600',
    trendUp: 'text-success-600',
    trendDown: 'text-danger-600',
  },
  red: {
    bg: 'bg-danger-500/10',
    border: 'border-danger-500/30',
    icon: 'text-danger-600',
    trendUp: 'text-success-600',
    trendDown: 'text-danger-600',
  },
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'teal',
  loading = false,
}) => {
  const colors = colorConfig[color]

  if (loading) {
    return (
      <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-6 h-40 animate-pulse`}>
        <div className="flex items-start justify-between mb-4">
          <div className="h-8 w-8 rounded-lg bg-surface-border" />
          <div className="h-6 w-12 rounded bg-surface-border" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-24 rounded bg-surface-border" />
          <div className="h-8 w-32 rounded bg-surface-border" />
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-6 transition-all duration-300 hover:shadow-lg-light`}>
      <div className="flex items-start justify-between mb-4">
        <div className="rounded-lg bg-surface-card p-2.5">
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? colors.trendUp : colors.trendDown}`}>
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-text-primary mb-2">{value}</p>
        {trendLabel && <p className="text-xs text-text-tertiary">{trendLabel}</p>}
      </div>
    </div>
  )
}

export default StatCard

