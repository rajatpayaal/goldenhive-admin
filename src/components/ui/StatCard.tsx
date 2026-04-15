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
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-200 dark:border-teal-800/50',
    icon: 'text-teal-600 dark:text-teal-400',
    trendUp: 'text-success-600 dark:text-success-400',
    trendDown: 'text-danger-600 dark:text-danger-400',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800/50',
    icon: 'text-blue-600 dark:text-blue-400',
    trendUp: 'text-success-600 dark:text-success-400',
    trendDown: 'text-danger-600 dark:text-danger-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800/50',
    icon: 'text-success-600 dark:text-success-400',
    trendUp: 'text-success-600 dark:text-success-400',
    trendDown: 'text-danger-600 dark:text-danger-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800/50',
    icon: 'text-warning-600 dark:text-warning-400',
    trendUp: 'text-success-600 dark:text-success-400',
    trendDown: 'text-danger-600 dark:text-danger-400',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800/50',
    icon: 'text-danger-600 dark:text-danger-400',
    trendUp: 'text-success-600 dark:text-success-400',
    trendDown: 'text-danger-600 dark:text-danger-400',
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
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-6 w-12 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-6 transition-all duration-300 hover:shadow-card-light dark:hover:shadow-card-dark`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-white dark:bg-gray-800">
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

