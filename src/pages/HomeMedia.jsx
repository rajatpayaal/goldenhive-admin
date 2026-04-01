import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Upload, Loader2, Film } from 'lucide-react';
import { homeMediaAPI } from '../api/endpoints';
import toast from 'react-hot-toast';

export default function HomeMedia() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [mode, setMode] = useState('create');
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [existingMediaUrl, setExistingMediaUrl] = useState('');
  const [existingMediaType, setExistingMediaType] = useState('IMAGE');
  const [form, setForm] = useState({ title:'', mediaType:'IMAGE', order:1, isActive:true });

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const r = await homeMediaAPI.list(); setItems(r.data.data || []); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const openCreate = () => { setForm({title:'',mediaType:'IMAGE',order:1,isActive:true}); setMode('create'); setEditId(null); setMediaFile(null); setExistingMediaUrl(''); setShowDrawer(true); };
  const openEdit = (m) => { setForm({title:m.title||'',mediaType:m.mediaType||'IMAGE',order:m.order||1,isActive:m.isActive!==false}); setMode('edit'); setEditId(m._id); setMediaFile(null); setExistingMediaUrl(m.mediaUrl||''); setExistingMediaType(m.mediaType||'IMAGE'); setShowDrawer(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title',form.title); fd.append('mediaType',form.mediaType);
      fd.append('order',form.order); fd.append('isActive',form.isActive);
      if (mediaFile) fd.append('media', mediaFile);
      if (mode==='create') { await homeMediaAPI.create(fd); toast.success('Created!'); }
      else { await homeMediaAPI.update(editId, fd); toast.success('Updated!'); }
      setShowDrawer(false); load();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await homeMediaAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header"><h1>Home Media</h1><button className="btn btn-primary" onClick={openCreate}><Plus size={16}/> Add Media</button></div>

      {loading?<div className="page-loading"><div className="loading-spinner" style={{width:28,height:28}}></div></div>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
          {items.length===0?<div className="empty-state" style={{gridColumn:'1/-1'}}><Film size={40}/><p>No home media</p></div>:
          items.map(m=>(
            <div key={m._id} className="card" style={{padding:0,overflow:'hidden'}}>
              {m.mediaUrl && (m.mediaType==='VIDEO'?
                <video src={m.mediaUrl} style={{width:'100%',height:140,objectFit:'cover'}} muted/>:
                <img src={m.mediaUrl} alt={m.title} style={{width:'100%',height:140,objectFit:'cover'}}/>
              )}
              <div style={{padding:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <h3 style={{fontSize:14,fontWeight:600}}>{m.title||'Untitled'}</h3>
                  <span className={`badge ${m.isActive?'badge-active':'badge-inactive'}`} style={{fontSize:10}}><span className="badge-dot"></span>{m.isActive?'On':'Off'}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:11,color:'var(--text-muted)'}}>{m.mediaType} · Order: {m.order}</span>
                  <div style={{display:'flex',gap:4}}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>openEdit(m)}><Edit2 size={14}/></button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)'}} onClick={()=>handleDelete(m._id)}><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDrawer && (
        <div className="drawer-overlay animate-fadeIn" onClick={()=>setShowDrawer(false)}>
          <div className="drawer animate-slideInRight" onClick={e=>e.stopPropagation()} style={{width:440}}>
            <div className="drawer-header"><h2>{mode==='create'?'Add Media':'Edit Media'}</h2><button className="btn btn-ghost btn-icon" onClick={()=>setShowDrawer(false)}><X size={20}/></button></div>
            <div className="drawer-body">
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e=>set('title',e.target.value)}/></div>
                <div className="form-row form-grid-2">
                  <div className="form-group"><label className="form-label">Type</label>
                    <select className="form-select" value={form.mediaType} onChange={e=>set('mediaType',e.target.value)}>
                      <option>IMAGE</option><option>BANNER</option><option>VIDEO</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Order</label><input className="form-input" type="number" value={form.order} onChange={e=>set('order',e.target.value)}/></div>
                </div>
                <div className="form-group">
                  <label className="form-label">File</label>
                  {existingMediaUrl && !mediaFile && (
                    <div style={{ marginBottom: 8, borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative' }}>
                      {existingMediaType === 'VIDEO'
                        ? <video src={existingMediaUrl} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} muted />
                        : <img src={existingMediaUrl} alt="current" style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
                      }
                      <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>Current {existingMediaType}</div>
                    </div>
                  )}
                  <div style={{border:'2px dashed var(--border)',borderRadius:'var(--radius)',padding:20,textAlign:'center',cursor:'pointer',background:mediaFile?'var(--success-bg)':'var(--bg-primary)'}}
                    onClick={()=>document.getElementById('mediaF').click()}>
                    <Upload size={18} style={{color:'var(--text-muted)'}}/>
                    <p style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>{mediaFile ? mediaFile.name : existingMediaUrl ? 'Click to replace file' : 'Upload image or video'}</p>
                  </div>
                  <input type="file" id="mediaF" accept="image/*,video/*" hidden onChange={e=>setMediaFile(e.target.files[0])}/>
                </div>
                <div className="form-group" style={{display:'flex',alignItems:'center',gap:8}}>
                  <input type="checkbox" checked={form.isActive} onChange={e=>set('isActive',e.target.checked)} style={{width:16,height:16,accentColor:'var(--gold)'}}/>
                  <label style={{fontSize:13,color:'var(--text-secondary)'}}>Active</label>
                </div>
              </div>
            </div>
            <div className="drawer-footer">
              <button className="btn btn-secondary" onClick={()=>setShowDrawer(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?<Loader2 size={16} className="loading-spinner"/>:null}{mode==='create'?'Create':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

