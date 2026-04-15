import React from 'react'
import { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: number // positive = up, negative = down
  trendLabel?: string
  color?: 'orange' | 'blue' | 'green' | 'purple' | 'red'
  loading?: boolean
}

const colorMap = {
  orange: 'from-brand-500/20 to-brand-600/10 border-brand-500/20 text-brand-400',
  blue:   'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
  green:  'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
  purple: 'from-violet-500/20 to-violet-600/10 border-violet-500/20 text-violet-400',
  red:    'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400',
}

const StatCard: React.FC<StatCardProps> = ({
  title, value, icon: Icon, trend, trendLabel, color = 'orange', loading = false,
}) => {
  const colors = colorMap[color]

  if (loading) {
    return (
      <div className="stat-card">
        <div className="skeleton h-8 w-8 rounded-lg" />
        <div className="space-y-2">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-7 w-16 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className={`stat-card bg-gradient-to-br ${colors.split(' ')[0]} ${colors.split(' ')[1]}`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors} flex items-center justify-center border`}>
          <Icon className={`w-5 h-5 ${colors.split(' ')[3]}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-slate-100 mt-0.5">{value}</p>
        {trendLabel && <p className="text-xs text-slate-500 mt-1">{trendLabel}</p>}
      </div>
    </div>
  )
}

export default StatCard
