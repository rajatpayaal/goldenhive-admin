import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Upload, Loader2, Clock, AlertCircle } from 'lucide-react';
import { slotsAPI, activitiesAPI } from '../api/endpoints';
import toast from 'react-hot-toast';

export default function ActivitySlots() {
  const [slots, setSlots] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [mode, setMode] = useState('create');
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    activityId: '', slotDate: '', startTime: '', endTime: '',
    capacity: 1, price: 0, status: 'OPEN'
  });

  useEffect(() => { load(); loadActivities(); }, []);

  const load = async () => {
    try { const r = await slotsAPI.list(); setSlots(r.data.data || []); }
    catch { toast.error('Failed to load slots'); }
    finally { setLoading(false); }
  };

  const loadActivities = async () => {
    try { const r = await activitiesAPI.list(); setActivities(r.data.data || []); }
    catch { /* best effort */ }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => {
    setForm({ activityId: '', slotDate: '', startTime: '', endTime: '', capacity: 1, price: 0, status: 'OPEN' });
    setMode('create'); setEditId(null); setShowDrawer(true);
  };

  const openEdit = (s) => {
    setForm({
      activityId: s.activityId || '',
      slotDate: s.slotDate ? new Date(s.slotDate).toISOString().slice(0, 10) : '',
      startTime: s.startTime || '', endTime: s.endTime || '',
      capacity: s.capacity || 1, price: s.price || 0, status: s.status || 'OPEN'
    });
    setMode('edit'); setEditId(s._id); setShowDrawer(true);
  };

  const handleSave = async () => {
    if (!form.activityId) { toast.error('Select an activity'); return; }
    if (!form.slotDate) { toast.error('Select a date'); return; }
    setSaving(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity), price: Number(form.price) };
      if (mode === 'create') {
        await slotsAPI.create(payload);
        toast.success('Slot created!');
      } else {
        await slotsAPI.update(editId, payload);
        toast.success('Slot updated!');
      }
      setShowDrawer(false); load();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this slot?')) return;
    try { await slotsAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const getActivityName = (actId) => {
    const act = activities.find(a => a._id === actId);
    return act ? act.basic?.name : actId?.slice(0, 8) + '...';
  };

  const filtered = slots.filter(s =>
    !search ||
    getActivityName(s.activityId).toLowerCase().includes(search.toLowerCase()) ||
    (s.status || '').toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_COLOR = { OPEN: 'var(--success)', FULL: 'var(--danger)', CLOSED: 'var(--text-muted)' };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1>Activity Slots</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Slot</button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="search-input">
            <Clock size={16} />
            <input placeholder="Search by activity or status..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="table-count">{filtered.length} slots</span>
        </div>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner" style={{ width: 28, height: 28 }}></div></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Date</th>
                <th>Time</th>
                <th>Capacity</th>
                <th>Booked</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state"><Clock size={36} /><p>No slots found</p></div>
                </td></tr>
              ) : filtered.map(s => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 180 }}>
                    {getActivityName(s.activityId)}
                  </td>
                  <td>{s.slotDate ? new Date(s.slotDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {s.startTime || '—'} {s.endTime ? `– ${s.endTime}` : ''}
                  </td>
                  <td>{s.capacity}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{s.bookedSeats || 0}</span>
                      {s.bookedSeats >= s.capacity && <AlertCircle size={13} style={{ color: 'var(--danger)' }} />}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{(s.price || 0).toLocaleString()}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 10px', borderRadius: 'var(--radius-full)',
                      fontSize: 11, fontWeight: 600,
                      background: `${STATUS_COLOR[s.status] || 'var(--text-muted)'}1a`,
                      color: STATUS_COLOR[s.status] || 'var(--text-muted)'
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[s.status] || 'var(--text-muted)' }} />
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(s)}><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(s._id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showDrawer && (
        <div className="drawer-overlay animate-fadeIn" onClick={() => setShowDrawer(false)}>
          <div className="drawer animate-slideInRight" onClick={e => e.stopPropagation()} style={{ width: 460 }}>
            <div className="drawer-header">
              <h2>{mode === 'create' ? 'Add Slot' : 'Edit Slot'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowDrawer(false)}><X size={20} /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Activity Selector */}
                <div className="form-group">
                  <label className="form-label">Activity *</label>
                  {activities.length > 0 ? (
                    <select className="form-select" value={form.activityId} onChange={e => set('activityId', e.target.value)}>
                      <option value="">— Select Activity —</option>
                      {activities.map(a => (
                        <option key={a._id} value={a._id}>
                          {a.basic?.name} {a.activityCode ? `(${a.activityCode})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input className="form-input" value={form.activityId} onChange={e => set('activityId', e.target.value)} placeholder="Activity ObjectId" />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input className="form-input" type="date" value={form.slotDate} onChange={e => set('slotDate', e.target.value)} />
                </div>

                <div className="form-row form-grid-2">
                  <div className="form-group"><label className="form-label">Start Time</label><input className="form-input" type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">End Time</label><input className="form-input" type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} /></div>
                </div>

                <div className="form-row form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Capacity</label>
                    <input className="form-input" type="number" min={1} value={form.capacity} onChange={e => set('capacity', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input className="form-input" type="number" min={0} value={form.price} onChange={e => set('price', e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="OPEN">OPEN</option>
                    <option value="FULL">FULL</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

              </div>
            </div>
            <div className="drawer-footer">
              <button className="btn btn-secondary" onClick={() => setShowDrawer(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="loading-spinner" /> : null}
                {mode === 'create' ? 'Create Slot' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

