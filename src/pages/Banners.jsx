import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Upload, Loader2, Image } from 'lucide-react';
import { bannersAPI } from '../api/endpoints';
import toast from 'react-hot-toast';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [mode, setMode] = useState('create');
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [form, setForm] = useState({ title:'', description:'', seoTitle:'', seoDescription:'',
    redirectType:'PACKAGE', redirectId:'', sortOrder:1, isActive:true });

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const r = await bannersAPI.list(); setBanners(r.data.data || []); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const openCreate = () => { setForm({title:'',description:'',seoTitle:'',seoDescription:'',redirectType:'PACKAGE',redirectId:'',sortOrder:1,isActive:true}); setMode('create'); setEditId(null); setImageFile(null); setExistingImageUrl(''); setShowDrawer(true); };
  const openEdit = (b) => { setForm({title:b.title||'',description:b.description||'',seoTitle:b.seoTitle||'',seoDescription:b.seoDescription||'',redirectType:b.redirectType||'PACKAGE',redirectId:b.redirectId||'',sortOrder:b.sortOrder||1,isActive:b.isActive!==false}); setMode('edit'); setEditId(b._id); setImageFile(null); setExistingImageUrl(b.imageUrl||''); setShowDrawer(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title',form.title); fd.append('description',form.description);
      fd.append('seoTitle',form.seoTitle); fd.append('seoDescription',form.seoDescription);
      fd.append('redirectType',form.redirectType); fd.append('redirectId',form.redirectId);
      fd.append('sortOrder',form.sortOrder); fd.append('isActive',form.isActive);
      if (imageFile) fd.append('image', imageFile);
      if (mode==='create') { await bannersAPI.create(fd); toast.success('Banner created!'); }
      else { await bannersAPI.update(editId, fd); toast.success('Banner updated!'); }
      setShowDrawer(false); load();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try { await bannersAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header"><h1>Banners</h1><button className="btn btn-primary" onClick={openCreate}><Plus size={16}/> Add Banner</button></div>

      {loading ? <div className="page-loading"><div className="loading-spinner" style={{width:28,height:28}}></div></div> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
          {banners.length === 0 ? <div className="empty-state" style={{gridColumn:'1/-1'}}><Image size={40}/><p>No banners yet</p></div> :
          banners.map(b => (
            <div key={b._id} className="card" style={{ padding:0, overflow:'hidden' }}>
              {b.imageUrl && <img src={b.imageUrl} alt={b.title} style={{width:'100%',height:160,objectFit:'cover'}} />}
              <div style={{ padding:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <h3 style={{ fontSize:15, fontWeight:600 }}>{b.title || 'Untitled'}</h3>
                  <span className={`badge ${b.isActive?'badge-active':'badge-inactive'}`}><span className="badge-dot"></span>{b.isActive?'Active':'Inactive'}</span>
                </div>
                <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>{b.description || ''}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:11, color:'var(--text-muted)' }}>Order: {b.sortOrder} · {b.redirectType}</span>
                  <div style={{ display:'flex', gap:4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>openEdit(b)}><Edit2 size={14}/></button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)'}} onClick={()=>handleDelete(b._id)}><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDrawer && (
        <div className="drawer-overlay animate-fadeIn" onClick={()=>setShowDrawer(false)}>
          <div className="drawer animate-slideInRight" onClick={e=>e.stopPropagation()} style={{width:480}}>
            <div className="drawer-header"><h2>{mode==='create'?'Add Banner':'Edit Banner'}</h2><button className="btn btn-ghost btn-icon" onClick={()=>setShowDrawer(false)}><X size={20}/></button></div>
            <div className="drawer-body">
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e=>set('title',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={2} value={form.description} onChange={e=>set('description',e.target.value)}/></div>
                <div className="form-group">
                  <label className="form-label">Banner Image</label>
                  {existingImageUrl && !imageFile && (
                    <div style={{ marginBottom: 8, borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative' }}>
                      <img src={existingImageUrl} alt="current" style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>Current Image</div>
                    </div>
                  )}
                  <div style={{border:'2px dashed var(--border)',borderRadius:'var(--radius)',padding:20,textAlign:'center',cursor:'pointer',background:imageFile?'var(--success-bg)':'var(--bg-primary)'}}
                    onClick={()=>document.getElementById('bannerImg').click()}>
                    <Upload size={18} style={{color:'var(--text-muted)'}}/>
                    <p style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>{imageFile ? imageFile.name : existingImageUrl ? 'Click to replace image' : 'Upload banner image'}</p>
                  </div>
                  <input type="file" id="bannerImg" accept="image/*" hidden onChange={e=>setImageFile(e.target.files[0])}/>
                </div>
                <div className="form-row form-grid-2">
                  <div className="form-group"><label className="form-label">Redirect Type</label>
                    <select className="form-select" value={form.redirectType} onChange={e=>set('redirectType',e.target.value)}>
                      <option>PACKAGE</option><option>ACTIVITY</option><option>CUSTOM</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Redirect ID</label><input className="form-input" value={form.redirectId} onChange={e=>set('redirectId',e.target.value)}/></div>
                </div>
                <div className="form-row form-grid-2">
                  <div className="form-group"><label className="form-label">Sort Order</label><input className="form-input" type="number" value={form.sortOrder} onChange={e=>set('sortOrder',e.target.value)}/></div>
                  <div className="form-group" style={{display:'flex',alignItems:'center',gap:8,paddingTop:24}}>
                    <input type="checkbox" checked={form.isActive} onChange={e=>set('isActive',e.target.checked)} style={{width:16,height:16,accentColor:'var(--gold)'}}/>
                    <label style={{fontSize:13,color:'var(--text-secondary)'}}>Active</label>
                  </div>
                </div>
                <div className="form-row form-grid-2">
                  <div className="form-group"><label className="form-label">SEO Title</label><input className="form-input" value={form.seoTitle} onChange={e=>set('seoTitle',e.target.value)}/></div>
                  <div className="form-group"><label className="form-label">SEO Description</label><input className="form-input" value={form.seoDescription} onChange={e=>set('seoDescription',e.target.value)}/></div>
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
