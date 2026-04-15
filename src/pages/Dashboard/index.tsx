import React, { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { DollarSign, CalendarCheck, Users, Package, TrendingUp } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import { PageHeader } from '../../components/ui'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { getDashboard } from './service'

const chartAxisColor = 'var(--color-text-tertiary)'
const chartGridColor = 'var(--color-surface-border)'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card space-y-1 px-3 py-2 text-xs">
      <p className="font-semibold text-text-primary">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard({ days: 30, recentLimit: 8, topLimit: 5 })
      .then((res) => setData(res.data?.data || res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const stats = data?.summary || {}
  const revenueChart = data?.revenueChart || []
  const bookingChart = data?.bookingChart || []
  const recentBookings = data?.recentBookings || []

  const bookingCols = [
    {
      header: 'Booking #',
      render: (r: any) => <span className="font-mono text-xs text-primary-500">{r.bookingNo}</span>,
    },
    {
      header: 'Customer',
      render: (r: any) => {
        const u = r.userId || {}
        return <span>{u.firstName || ''} {u.lastName || ''}</span>
      },
    },
    {
      header: 'Package',
      render: (r: any) => {
        const pkg = r.packageItems?.[0]?.packageId
        return <span className="text-text-secondary">{pkg?.basic?.name || '—'}</span>
      },
    },
    {
      header: 'Amount',
      render: (r: any) => <span className="font-semibold">₹{(r.totalAmount || 0).toLocaleString()}</span>,
    },
    { header: 'Status', render: (r: any) => <StatusBadge status={r.status} type="booking" /> },
    { header: 'Payment', render: (r: any) => <StatusBadge status={r.paymentStatus} type="payment" /> },
    {
      header: 'Date',
      render: (r: any) => (
        <span className="text-xs text-text-tertiary">
          {r.createdAt ? format(new Date(r.createdAt), 'dd MMM yyyy') : '—'}
        </span>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening today."
        breadcrumbs={[{ label: 'Home' }, { label: 'Dashboard' }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={loading ? '—' : `₹${((stats.totalRevenue || 0) / 1000).toFixed(1)}K`}
          icon={DollarSign}
          color="orange"
          trend={stats.revenueTrend}
          trendLabel="vs last period"
          loading={loading}
        />
        <StatCard
          title="Total Bookings"
          value={loading ? '—' : (stats.totalBookings || 0)}
          icon={CalendarCheck}
          color="blue"
          trend={stats.bookingTrend}
          loading={loading}
        />
        <StatCard
          title="Total Users"
          value={loading ? '—' : (stats.totalUsers || 0)}
          icon={Users}
          color="green"
          trend={stats.userTrend}
          loading={loading}
        />
        <StatCard
          title="Total Packages"
          value={loading ? '—' : (stats.totalPackages || 0)}
          icon={Package}
          color="teal"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Revenue Trend</h3>
              <p className="text-xs text-text-tertiary">Last 30 days</p>
            </div>
            <TrendingUp className="h-4 w-4 text-primary-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartAxisColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: chartAxisColor }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue (₹)"
                stroke="#f97316"
                fill="url(#revGrad)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Booking Trend</h3>
              <p className="text-xs text-text-tertiary">Last 30 days</p>
            </div>
            <CalendarCheck className="h-4 w-4 text-primary-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bookingChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: chartAxisColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: chartAxisColor }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: chartAxisColor }} />
              <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="confirmed" name="Confirmed" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h3 className="text-sm font-bold text-text-primary">Recent Bookings</h3>
          <a href="/bookings" className="text-xs font-medium text-primary-500 hover:text-primary-400">View all →</a>
        </div>
        <DataTable
          columns={bookingCols}
          data={recentBookings}
          loading={loading}
          keyExtractor={(r: any) => r._id}
          emptyMessage="No recent bookings"
        />
      </div>
    </div>
  )
}

export default DashboardPage
