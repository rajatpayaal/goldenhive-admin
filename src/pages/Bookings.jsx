import { useState, useEffect } from 'react';
import { Search, CalendarCheck, Users as UsersIcon, MapPin, Calendar, ChevronRight, X, Loader2, Send } from 'lucide-react';
import { bookingsAPI } from '../api/endpoints';
import toast from 'react-hot-toast';

const STATUSES = ['REQUESTED', 'CONTACTED', 'NEGOTIATING', 'APPROVED', 'REJECTED'];
const STATUS_COLORS = {
  REQUESTED: 'var(--info)', CONTACTED: 'var(--warning)',
  NEGOTIATING: '#f97316', APPROVED: 'var(--success)', REJECTED: 'var(--danger)',
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const r = await bookingsAPI.listAll(); setBookings(r.data.data || []); }
    catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      await bookingsAPI.updateStatus(id, { status, note: noteText || undefined });
      toast.success(`Status → ${status}`);
      setNoteText('');
      load();
      if (selected?._id === id) {
        const r = await bookingsAPI.listAll();
        const updated = (r.data.data || []).find(b => b._id === id);
        if (updated) setSelected(updated);
      }
    } catch (err) { toast.error(err?.response?.data?.error || 'Update failed'); }
    finally { setUpdating(false); }
  };

  const filtered = bookings.filter(b => {
    const matchSearch = !search || (b.bookingNo || '').toLowerCase().includes(search.toLowerCase())
      || (b.packageSnapshot?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const grouped = {};
  STATUSES.forEach(s => { grouped[s] = filtered.filter(b => b.status === s); });

  if (loading) return <div className="page-loading"><div className="loading-spinner" style={{width:32,height:32}}></div></div>;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1>Bookings</h1>
        <div className="page-header-actions">
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className={`tab ${view==='kanban'?'active':''}`} onClick={()=>setView('kanban')}>Kanban</button>
            <button className={`tab ${view==='table'?'active':''}`} onClick={()=>setView('table')}>Table</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-input">
          <Search size={16} /><input placeholder="Search bookings..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="form-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
          style={{ padding: '8px 32px 8px 12px', fontSize: 13 }}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {view === 'kanban' ? (
        <div className="kanban-board">
          {STATUSES.map(status => (
            <div key={status} className="kanban-column">
              <div className="kanban-column-header">
                <h3>
                  <span className="col-dot" style={{ background: STATUS_COLORS[status] }}></span>
                  {status}
                </h3>
                <span className="col-count">{grouped[status].length}</span>
              </div>
              <div className="kanban-column-body">
                {grouped[status].length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: 20 }}>No bookings</div>
                ) : grouped[status].map(b => (
                  <div key={b._id} className="kanban-card" onClick={() => setSelected(b)}>
                    <div className="kanban-card-header">
                      <span className="kanban-card-id">{b.bookingNo}</span>
                      <span className="kanban-card-price">₹{(b.totalPrice||0).toLocaleString()}</span>
                    </div>
                    <div className="kanban-card-body">
                      <p style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} /> {b.packageSnapshot?.name || 'No package'}
                      </p>
                      <p style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} /> {b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </div>
                    <div className="kanban-card-footer">
                      <span className="kanban-card-meta"><UsersIcon size={12} /> {b.travellers || 1} pax</span>
                      <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Booking No</th><th>Package</th><th>Date</th><th>Pax</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.length===0?<tr><td colSpan={6}><div className="empty-state"><CalendarCheck size={36}/><p>No bookings</p></div></td></tr>:
              filtered.map(b=>(
                <tr key={b._id} style={{cursor:'pointer'}} onClick={()=>setSelected(b)}>
                  <td style={{color:'var(--gold)',fontWeight:600}}>{b.bookingNo}</td>
                  <td style={{color:'var(--text-primary)'}}>{b.packageSnapshot?.name||'—'}</td>
                  <td>{b.travelDate?new Date(b.travelDate).toLocaleDateString('en-IN'):'—'}</td>
                  <td>{b.travellers||1}</td>
                  <td style={{fontWeight:600,color:'var(--text-primary)'}}>₹{(b.totalPrice||0).toLocaleString()}</td>
                  <td><span className={`badge badge-${(b.status||'').toLowerCase()}`}><span className="badge-dot"></span>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Side Panel */}
      {selected && (
        <div className="drawer-overlay animate-fadeIn" onClick={()=>setSelected(null)}>
          <div className="drawer animate-slideInRight" onClick={e=>e.stopPropagation()}>
            <div className="drawer-header">
              <h2 style={{ color: 'var(--gold)' }}>{selected.bookingNo}</h2>
              <button className="btn btn-ghost btn-icon" onClick={()=>setSelected(null)}><X size={20}/></button>
            </div>
            <div className="drawer-body">
              <div className="detail-panel" style={{ marginBottom: 16 }}>
                <div className="detail-section">
                  <h4>Package</h4>
                  <div className="detail-row"><span className="label">Name</span><span className="value">{selected.packageSnapshot?.name||'—'}</span></div>
                  <div className="detail-row"><span className="label">Destination</span><span className="value">{selected.packageSnapshot?.destination||'—'}</span></div>
                  <div className="detail-row"><span className="label">Duration</span><span className="value">{selected.packageSnapshot?.durationDays||0}D / {selected.packageSnapshot?.nights||0}N</span></div>
                </div>
                <div className="detail-section">
                  <h4>Booking Details</h4>
                  <div className="detail-row"><span className="label">Travel Date</span><span className="value">{selected.travelDate?new Date(selected.travelDate).toLocaleDateString('en-IN'):'—'}</span></div>
                  <div className="detail-row"><span className="label">Travellers</span><span className="value">{selected.travellers||1}</span></div>
                  <div className="detail-row"><span className="label">Status</span>
                    <span className={`badge badge-${(selected.status||'').toLowerCase()}`}><span className="badge-dot"></span>{selected.status}</span>
                  </div>
                </div>
                <div className="detail-section">
                  <h4>Pricing</h4>
                  <div className="detail-row"><span className="label">Base Price</span><span className="value">₹{(selected.pricing?.basePrice||0).toLocaleString()}</span></div>
                  <div className="detail-row"><span className="label">Discount</span><span className="value">{selected.pricing?.discountPercent||0}%</span></div>
                  <div className="detail-row"><span className="label">Final Price</span><span className="value" style={{color:'var(--gold)',fontWeight:700}}>₹{(selected.pricing?.finalPrice||selected.totalPrice||0).toLocaleString()}</span></div>
                </div>
                {selected.tripDetails && (
                  <div className="detail-section">
                    <h4>Trip Details</h4>
                    {selected.tripDetails.pickup && <div className="detail-row"><span className="label">Pickup</span><span className="value">{selected.tripDetails.pickup}</span></div>}
                    {selected.tripDetails.drop && <div className="detail-row"><span className="label">Drop</span><span className="value">{selected.tripDetails.drop}</span></div>}
                    {selected.tripDetails.meals && <div className="detail-row"><span className="label">Meals</span><span className="value">{selected.tripDetails.meals}</span></div>}
                    {selected.tripDetails.stay && <div className="detail-row"><span className="label">Stay</span><span className="value">{selected.tripDetails.stay}</span></div>}
                    {selected.tripDetails.transport && <div className="detail-row"><span className="label">Transport</span><span className="value">{selected.tripDetails.transport}</span></div>}
                  </div>
                )}
                {(selected.notes||[]).length > 0 && (
                  <div className="detail-section">
                    <h4>Notes Timeline</h4>
                    {selected.notes.map((n, i) => (
                      <div key={i} style={{ background:'var(--bg-elevated)', borderRadius:'var(--radius-sm)', padding:'10px 12px', marginBottom:8, fontSize:13 }}>
                        <p style={{ color:'var(--text-primary)' }}>{n.message}</p>
                        <p style={{ color:'var(--text-muted)', fontSize:11, marginTop:4 }}>{n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Note */}
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                <input className="form-input" placeholder="Add a note..." value={noteText} onChange={e=>setNoteText(e.target.value)} style={{flex:1}} />
                <button className="btn btn-secondary btn-icon" onClick={()=>{
                  if (!noteText.trim()) return;
                  updateStatus(selected._id, selected.status);
                }}><Send size={16}/></button>
              </div>

              {/* Status Actions */}
              <div>
                <h4 style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:10 }}>Change Status</h4>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {STATUSES.filter(s => s !== selected.status).map(s => (
                    <button key={s} className={`btn btn-sm`} disabled={updating}
                      style={{ background:STATUS_COLORS[s]+'1a', color:STATUS_COLORS[s], border:`1px solid ${STATUS_COLORS[s]}33` }}
                      onClick={() => updateStatus(selected._id, s)}>
                      {updating?<Loader2 size={14} className="loading-spinner"/>:null} {s}
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

