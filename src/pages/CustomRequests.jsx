import { useState, useEffect } from 'react';
import { Search, MessageSquare, ChevronRight, X, Loader2 } from 'lucide-react';
import { customRequestsAPI } from '../api/endpoints';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  PENDING: 'var(--warning)',
  APPROVED: 'var(--success)',
  REJECTED: 'var(--danger)',
  IN_PROGRESS: 'var(--info)',
};

export default function CustomRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [updating, setUpdating] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const r = await customRequestsAPI.listAll(); setRequests(r.data.data || []); }
    catch { toast.error('Failed to load requests'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await customRequestsAPI.updateStatus(id, { status });
      toast.success(`Status → ${status}`);
      load();
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed'); }
    finally { setUpdating(null); }
  };

  const filtered = requests.filter(r => {
    const matchSearch = !search ||
      (r.destinations || []).join(' ').toLowerCase().includes(search.toLowerCase()) ||
      (r.preferences || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.email || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {};
  requests.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });

  return (
    <div className="animate-fadeIn">
      <div className="page-header"><h1>Custom Requests</h1></div>

      {/* Status Quick Filter Pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['', 'All', requests.length], ['PENDING', 'Pending', counts.PENDING || 0], ['IN_PROGRESS', 'In Progress', counts.IN_PROGRESS || 0], ['APPROVED', 'Approved', counts.APPROVED || 0], ['REJECTED', 'Rejected', counts.REJECTED || 0]].map(([val, label, count]) => (
          <button key={val} onClick={() => setFilterStatus(val)} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            border: `1px solid ${filterStatus === val ? 'var(--gold)' : 'var(--border)'}`,
            background: filterStatus === val ? 'var(--gold)' : 'var(--bg-elevated)',
            color: filterStatus === val ? '#000' : 'var(--text-secondary)', transition: 'all 0.2s'
          }}>
            {label} <span style={{ opacity: 0.7 }}>({count})</span>
          </button>
        ))}
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="search-input">
            <MessageSquare size={16} />
            <input placeholder="Search by name, destination, preference..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="table-count">{filtered.length}</span>
        </div>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner" style={{ width: 28, height: 28 }}></div></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Destinations</th>
                <th>Budget</th>
                <th>Travellers</th>
                <th>Status</th>
                <th>Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state"><MessageSquare size={36} /><p>No custom requests</p></div>
                </td></tr>
              ) : filtered.map(r => (
                <tr key={r._id} style={{ cursor: 'pointer' }} onClick={() => setSelected(r)}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.name || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.email || r.phone || '—'}</div>
                  </td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {(r.destinations || []).join(', ') || '—'}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {r.budget ? `₹${Number(r.budget).toLocaleString()}` : '—'}
                  </td>
                  <td>{r.travellers || '—'}</td>
                  <td>
                    <span className={`badge badge-${(r.status || '').toLowerCase()}`}>
                      <span className="badge-dot"></span>{r.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td><ChevronRight size={16} style={{ color: 'var(--text-muted)' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Side Panel */}
      {selected && (
        <div className="drawer-overlay animate-fadeIn" onClick={() => setSelected(null)}>
          <div className="drawer animate-slideInRight" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 style={{ color: 'var(--gold)' }}>Request Details</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div className="drawer-body">
              {/* Contact */}
              <div className="detail-panel">
                <div className="detail-section">
                  <h4>Contact Info</h4>
                  <div className="detail-row"><span className="label">Name</span><span className="value">{selected.name || '—'}</span></div>
                  <div className="detail-row"><span className="label">Email</span><span className="value">{selected.email || '—'}</span></div>
                  <div className="detail-row"><span className="label">Phone</span><span className="value">{selected.phone || '—'}</span></div>
                </div>

                <div className="detail-section">
                  <h4>Trip Details</h4>
                  <div className="detail-row"><span className="label">Destinations</span><span className="value">{(selected.destinations || []).join(', ') || '—'}</span></div>
                  <div className="detail-row"><span className="label">Budget</span><span className="value" style={{ color: 'var(--gold)', fontWeight: 700 }}>{selected.budget ? `₹${Number(selected.budget).toLocaleString()}` : '—'}</span></div>
                  <div className="detail-row"><span className="label">Travellers</span><span className="value">{selected.travellers || '—'}</span></div>
                  <div className="detail-row"><span className="label">Travel Date</span><span className="value">{selected.travelDate ? new Date(selected.travelDate).toLocaleDateString('en-IN') : '—'}</span></div>
                  <div className="detail-row"><span className="label">Duration</span><span className="value">{selected.duration || '—'}</span></div>
                </div>

                {selected.preferences && (
                  <div className="detail-section">
                    <h4>Preferences</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selected.preferences}</p>
                  </div>
                )}

                {selected.message && (
                  <div className="detail-section">
                    <h4>Message</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>{selected.message}</p>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Status</h4>
                  <span className={`badge badge-${(selected.status || '').toLowerCase()}`} style={{ fontSize: 13 }}>
                    <span className="badge-dot"></span>{selected.status}
                  </span>
                </div>
              </div>

              {/* Status Actions */}
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Change Status</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED']
                    .filter(s => s !== selected.status)
                    .map(s => (
                      <button key={s} disabled={updating === selected._id}
                        style={{
                          padding: '7px 14px', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 600,
                          background: `${STATUS_COLORS[s]}1a`, color: STATUS_COLORS[s],
                          border: `1px solid ${STATUS_COLORS[s]}33`, cursor: 'pointer'
                        }}
                        onClick={() => updateStatus(selected._id, s)}>
                        {updating === selected._id ? <Loader2 size={12} className="loading-spinner" /> : null} {s}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

