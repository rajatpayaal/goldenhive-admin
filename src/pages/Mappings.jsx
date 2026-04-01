import { useState, useEffect } from 'react';
import { Plus, Trash2, Link2, Loader2, Search } from 'lucide-react';
import { mappingsAPI, packagesAPI, activitiesAPI } from '../api/endpoints';
import toast from 'react-hot-toast';

export default function Mappings() {
  const [mappings, setMappings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ packageId: '', activityId: '', discountedPrice: 0, isIncluded: false });

  useEffect(() => { load(); loadPackages(); loadActivities(); }, []);

  const load = async () => {
    try { const r = await mappingsAPI.list(); setMappings(r.data.data || []); }
    catch { toast.error('Failed to load mappings'); }
    finally { setLoading(false); }
  };

  const loadPackages = async () => {
    try { const r = await packagesAPI.list(); setPackages(r.data.data || []); }
    catch { /* best-effort */ }
  };

  const loadActivities = async () => {
    try { const r = await activitiesAPI.list(); setActivities(r.data.data || []); }
    catch { /* best-effort */ }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.packageId) { toast.error('Select a package'); return; }
    if (!form.activityId) { toast.error('Select an activity'); return; }
    setSaving(true);
    try {
      await mappingsAPI.create({ ...form, discountedPrice: Number(form.discountedPrice) });
      toast.success('Mapping created!');
      setShowForm(false);
      setForm({ packageId: '', activityId: '', discountedPrice: 0, isIncluded: false });
      load();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this mapping?')) return;
    try { await mappingsAPI.delete(id); toast.success('Removed'); load(); }
    catch { toast.error('Failed'); }
  };

  const getPkgName = (id) => packages.find(p => p._id === id)?.basic?.name || id?.slice(0, 10) + '...';
  const getActName = (id) => activities.find(a => a._id === id)?.basic?.name || id?.slice(0, 10) + '...';
  const getPkgCode = (id) => packages.find(p => p._id === id)?.packageCode || '';
  const getActCode = (id) => activities.find(a => a._id === id)?.activityCode || '';

  const filtered = mappings.filter(m =>
    !search ||
    getPkgName(m.packageId).toLowerCase().includes(search.toLowerCase()) ||
    getActName(m.activityId).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1>Package ↔ Activity Mappings</h1>
        <button className="btn btn-primary" onClick={() => { setForm({ packageId: '', activityId: '', discountedPrice: 0, isIncluded: false }); setShowForm(true); }}>
          <Plus size={16} /> Add Mapping
        </button>
      </div>

      {/* New Mapping Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--gold-border)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--gold)' }}>New Mapping</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-row form-grid-2">
              <div className="form-group">
                <label className="form-label">Package *</label>
                <select className="form-select" value={form.packageId} onChange={e => set('packageId', e.target.value)}>
                  <option value="">— Select Package —</option>
                  {packages.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.basic?.name} {p.packageCode ? `(${p.packageCode})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Activity *</label>
                <select className="form-select" value={form.activityId} onChange={e => set('activityId', e.target.value)}>
                  <option value="">— Select Activity —</option>
                  {activities.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.basic?.name} {a.activityCode ? `(${a.activityCode})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '0 0 180px' }}>
                <label className="form-label">Discounted Price (₹)</label>
                <input className="form-input" type="number" min={0} value={form.discountedPrice} onChange={e => set('discountedPrice', e.target.value)} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 4 }}>
                <input type="checkbox" id="inclCheck" checked={form.isIncluded} onChange={e => set('isIncluded', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--gold)' }} />
                <label htmlFor="inclCheck" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>Included in package price</label>
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                  {saving ? <Loader2 size={14} className="loading-spinner" /> : null} Add Mapping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <div className="search-input">
            <Search size={16} />
            <input placeholder="Search by package or activity..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="table-count">{filtered.length} mappings</span>
        </div>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner" style={{ width: 28, height: 28 }}></div></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Package</th>
                <th>Activity</th>
                <th>Discounted Price</th>
                <th>Included</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty-state"><Link2 size={36} /><p>No mappings yet</p></div>
                </td></tr>
              ) : filtered.map(m => (
                <tr key={m._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{getPkgName(m.packageId)}</div>
                    {getPkgCode(m.packageId) && <div style={{ fontSize: 11, color: 'var(--gold)' }}>{getPkgCode(m.packageId)}</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{getActName(m.activityId)}</div>
                    {getActCode(m.activityId) && <div style={{ fontSize: 11, color: 'var(--info)' }}>{getActCode(m.activityId)}</div>}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.discountedPrice > 0 ? `₹${m.discountedPrice.toLocaleString()}` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>
                    <span className={`badge ${m.isIncluded ? 'badge-active' : 'badge-inactive'}`}>
                      <span className="badge-dot"></span>{m.isIncluded ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(m._id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

