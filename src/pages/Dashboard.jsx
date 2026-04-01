import { useState, useEffect } from 'react';
import {
  Package, Mountain, CalendarCheck, MessageSquare, Users, TrendingUp,
  TrendingDown, DollarSign, ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { packagesAPI, activitiesAPI, bookingsAPI, customRequestsAPI, usersAPI } from '../api/endpoints';
import { useNavigate } from 'react-router-dom';

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#06b6d4'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    packages: 0, activities: 0, bookings: 0, customRequests: 0, users: 0,
    bookingsByStatus: {},
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [destinationData, setDestinationData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [pkgRes, actRes, bookRes, crRes, usrRes] = await Promise.allSettled([
        packagesAPI.list(),
        activitiesAPI.list(),
        bookingsAPI.listAll(),
        customRequestsAPI.listAll(),
        usersAPI.list(),
      ]);

      const pkgs = pkgRes.status === 'fulfilled' ? pkgRes.value.data.data || [] : [];
      const acts = actRes.status === 'fulfilled' ? actRes.value.data.data || [] : [];
      const books = bookRes.status === 'fulfilled' ? bookRes.value.data.data || [] : [];
      const crs = crRes.status === 'fulfilled' ? crRes.value.data.data || [] : [];
      const usrs = usrRes.status === 'fulfilled' ? usrRes.value.data.data || [] : [];

      const bookingsByStatus = {};
      books.forEach(b => {
        bookingsByStatus[b.status] = (bookingsByStatus[b.status] || 0) + 1;
      });

      setStats({
        packages: pkgs.length,
        activities: acts.length,
        bookings: books.length,
        customRequests: crs.filter(c => c.status === 'PENDING').length,
        users: usrs.length,
        bookingsByStatus,
      });

      setRecentBookings(books.slice(0, 5));

      // ── Compute real revenue & booking trend per month ────────────────────
      const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const revenueMap = {};
      MONTHS.forEach(m => revenueMap[m] = 0);
      books.forEach(b => {
        if (!b.createdAt) return;
        const m = MONTHS[new Date(b.createdAt).getMonth()];
        revenueMap[m] = (revenueMap[m] || 0) + (b.totalPrice || 0);
      });
      setRevenueData(MONTHS.map(m => ({ month: m, revenue: revenueMap[m] })));

      // ── Compute real destination breakdown ────────────────────────────────
      const destMap = {};
      books.forEach(b => {
        const dest = b.packageSnapshot?.destination || 'Other';
        if (dest) destMap[dest] = (destMap[dest] || 0) + 1;
      });
      const sorted = Object.entries(destMap).sort((a, b) => b[1] - a[1]);
      const top5 = sorted.slice(0, 5);
      const otherCount = sorted.slice(5).reduce((sum, [, v]) => sum + v, 0);
      const destData = top5.map(([name, value]) => ({ name, value }));
      if (otherCount > 0) destData.push({ name: 'Others', value: otherCount });
      setDestinationData(destData.length > 0 ? destData : [{ name: 'No Data', value: 1 }]);

    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <div className="page-loading"><div className="loading-spinner" style={{ width: 32, height: 32 }}></div></div>;
  }

  return (
    <div className="animate-fadeIn">
      {/* KPI Cards */}
      <div className="kpi-grid stagger">
        <div className="kpi-card gold animate-fadeInUp">
          <div className="kpi-info">
            <h3>Total Bookings</h3>
            <div className="kpi-value">{stats.bookings}</div>
            <div className="kpi-change up">
              <TrendingUp size={14} /> +12.5% this month
            </div>
          </div>
          <div className="kpi-icon gold"><CalendarCheck size={22} /></div>
        </div>

        <div className="kpi-card blue animate-fadeInUp">
          <div className="kpi-info">
            <h3>Active Packages</h3>
            <div className="kpi-value">{stats.packages}</div>
            <div className="kpi-change up">
              <TrendingUp size={14} /> Live & bookable
            </div>
          </div>
          <div className="kpi-icon blue"><Package size={22} /></div>
        </div>

        <div className="kpi-card green animate-fadeInUp">
          <div className="kpi-info">
            <h3>Activities</h3>
            <div className="kpi-value">{stats.activities}</div>
            <div className="kpi-change up">
              <Mountain size={14} /> Adventures ready
            </div>
          </div>
          <div className="kpi-icon green"><Mountain size={22} /></div>
        </div>

        <div className="kpi-card purple animate-fadeInUp">
          <div className="kpi-info">
            <h3>Pending Requests</h3>
            <div className="kpi-value">{stats.customRequests}</div>
            <div className="kpi-change down">
              <MessageSquare size={14} /> Needs attention
            </div>
          </div>
          <div className="kpi-icon purple"><MessageSquare size={22} /></div>
        </div>

        <div className="kpi-card red animate-fadeInUp">
          <div className="kpi-info">
            <h3>Registered Users</h3>
            <div className="kpi-value">{stats.users}</div>
            <div className="kpi-change up">
              <Users size={14} /> Total users
            </div>
          </div>
          <div className="kpi-icon red"><Users size={22} /></div>
        </div>
      </div>

      {/* Booking Pipeline Mini */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Booking Pipeline</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/bookings')}>
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['REQUESTED', 'CONTACTED', 'NEGOTIATING', 'APPROVED', 'REJECTED'].map(status => {
            const colors = {
              REQUESTED: 'var(--info)', CONTACTED: 'var(--warning)',
              NEGOTIATING: '#f97316', APPROVED: 'var(--success)', REJECTED: 'var(--danger)'
            };
            return (
              <div key={status} style={{
                flex: '1 1 150px', background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius)', padding: '14px 16px',
                borderLeft: `3px solid ${colors[status]}`, minWidth: 140
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {status}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {stats.bookingsByStatus[status] || 0}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3><DollarSign size={16} style={{ color: 'var(--gold)', marginRight: 6 }} /> Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `₹${(v/1000)}k`} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)',
                  fontSize: 13
                }}
                formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="url(#goldGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Top Destinations</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={destinationData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {destinationData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)',
                  fontSize: 13
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', justifyContent: 'center' }}>
            {destinationData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: CHART_COLORS[i] }}></span>
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="table-container">
        <div className="table-header">
          <div className="table-header-left">
            <h2>Recent Bookings</h2>
            <span className="table-count">{recentBookings.length}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/bookings')}>
            View All
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Booking No</th>
              <th>Package</th>
              <th>Travel Date</th>
              <th>Travellers</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.length === 0 ? (
              <tr><td colSpan={6}><div className="empty-state"><p>No bookings yet</p></div></td></tr>
            ) : (
              recentBookings.map(b => (
                <tr key={b._id} style={{ cursor: 'pointer' }} onClick={() => navigate('/bookings')}>
                  <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{b.bookingNo}</td>
                  <td style={{ color: 'var(--text-primary)' }}>{b.packageSnapshot?.name || '—'}</td>
                  <td>{b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td>{b.travellers || 1}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{(b.totalPrice || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${(b.status || '').toLowerCase()}`}>
                      <span className="badge-dot"></span>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

