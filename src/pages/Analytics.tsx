import React, { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, DollarSign, Users } from 'lucide-react'
import { PageHeader } from '../components/ui'
import { fetchAdminAnalytics } from '../services/adminPanel.service'

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<any>(null)

  useEffect(() => {
    fetchAdminAnalytics(30)
      .then((response) => {
        setDashboard(response.data?.data || response.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const summary = dashboard?.summary || {}
  const revenueChart = dashboard?.revenueChart || []
  const bookingChart = dashboard?.bookingChart || []

  const conversionRate = useMemo(() => {
    const total = Number(summary.totalBookings || 0)
    const confirmed = Number(summary.confirmedBookings || 0)
    if (!total) return 0
    return Number(((confirmed / total) * 100).toFixed(1))
  }, [summary])

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Analytics"
        subtitle="Business intelligence and performance trends"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Analytics' }]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Revenue</p>
          <p className="mt-2 text-2xl font-bold text-orange-300">₹{Number(summary.totalRevenue || 0).toLocaleString()}</p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-300">
            <DollarSign className="h-3.5 w-3.5" />
            Total captured revenue
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Users</p>
          <p className="mt-2 text-2xl font-bold text-cyan-300">{Number(summary.totalUsers || 0).toLocaleString()}</p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-300">
            <Users className="h-3.5 w-3.5" />
            Active platform audience
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Conversion</p>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{conversionRate}%</p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-300">
            <Activity className="h-3.5 w-3.5" />
            Booking confirmation rate
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <h3 className="text-sm font-semibold text-slate-100">Revenue Trend</h3>
          <p className="mb-4 text-xs text-slate-400">Last 30 days</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueChart}>
              <defs>
                <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb923c" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Area dataKey="revenue" stroke="#fb923c" fill="url(#revenueGlow)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
          <h3 className="text-sm font-semibold text-slate-100">Booking Breakdown</h3>
          <p className="mb-4 text-xs text-slate-400">Volume by day and status</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bookingChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="confirmed" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-400">Loading analytics...</p>}
    </div>
  )
}

export default AnalyticsPage
