import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Upload, Loader2, Mountain } from 'lucide-react';
import { activitiesAPI } from '../api/endpoints';
import toast from 'react-hot-toast';

const TABS = ['Basic Info', 'Hero & Gallery', 'Overview & Info', 'Location & Safety', 'Policies & CTA', 'SEO'];

const emptyForm = {
  name: '', slug: '', tagline: '', location: '', duration: '', ageLimit: '',
  price: 0, discount: 0, currency: 'INR', status: 'ACTIVE',
  heroTitle: '', heroSubtitle: '',
  timing: '', quickDuration: '', difficulty: '', pickup: '', guide: '',
  overviewShort: '', overviewLong: '',
  highlights: '', inclusions: '', exclusions: '',
  address: '', mapUrl: '', safety: '', thingsToCarry: '', bestTime: '',
  cancellation: '', refund: '', terms: '',
  whatsapp: '', call: '', buttonText: 'Book Now',
  metaTitle: '', metaDescription: '', keywords: '',
};

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [mode, setMode] = useState('create');
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [heroFile, setHeroFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [existingHeroUrl, setExistingHeroUrl] = useState('');
  const [existingGallery, setExistingGallery] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const r = await activitiesAPI.list(); setActivities(r.data.data || []); }
    catch { toast.error('Failed to load activities'); }
    finally { setLoading(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => {
    setForm({ ...emptyForm });
    setMode('create'); setEditId(null);
    setHeroFile(null); setGalleryFiles([]);
    setExistingHeroUrl(''); setExistingGallery([]);
    setActiveTab(0); setShowDrawer(true);
  };

  const openEdit = (a) => {
    setForm({
      name: a.basic?.name || '', slug: a.basic?.slug || '', tagline: a.basic?.tagline || '',
      location: a.basic?.location || '', duration: a.basic?.duration || '',
      ageLimit: a.basic?.ageLimit || '', price: a.basic?.price || 0,
      discount: a.basic?.discount || 0, currency: a.basic?.currency || 'INR',
      heroTitle: a.hero?.title || '', heroSubtitle: a.hero?.subtitle || '',
      timing: a.quickInfo?.timing || '', quickDuration: a.quickInfo?.duration || '',
      difficulty: a.quickInfo?.difficulty || '', pickup: a.quickInfo?.pickup || '',
      guide: a.quickInfo?.guide || '', overviewShort: a.overview?.short || '',
      overviewLong: a.overview?.long || '',
      highlights: (a.highlights || []).join('\n'), inclusions: (a.inclusions || []).join('\n'),
      exclusions: (a.exclusions || []).join('\n'),
      address: a.location?.address || '', mapUrl: a.location?.mapUrl || '',
      safety: (a.safety || []).join('\n'), thingsToCarry: (a.thingsToCarry || []).join('\n'),
      bestTime: a.bestTime || '',
      cancellation: a.policies?.cancellation || '', refund: a.policies?.refund || '',
      terms: a.policies?.terms || '', whatsapp: a.cta?.whatsapp || '',
      call: a.cta?.call || '', buttonText: a.cta?.buttonText || 'Book Now',
      metaTitle: a.seo?.metaTitle || '', metaDescription: a.seo?.metaDescription || '',
      keywords: (a.seo?.keywords || []).join(', '), status: a.meta?.status || 'ACTIVE',
    });
    setExistingHeroUrl(a.hero?.primaryImage || '');
    setExistingGallery(a.gallery || []);
    setMode('edit'); setEditId(a._id);
    setHeroFile(null); setGalleryFiles([]);
    setActiveTab(0); setShowDrawer(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('slug', form.slug || form.name.toLowerCase().replace(/\s+/g, '-'));
      fd.append('tagline', form.tagline); fd.append('location', form.location);
      fd.append('duration', form.duration); fd.append('ageLimit', form.ageLimit);
      fd.append('price', form.price); fd.append('discount', form.discount);
      fd.append('currency', form.currency);
      fd.append('hero.title', form.heroTitle); fd.append('hero.subtitle', form.heroSubtitle);
      fd.append('quickInfo.timing', form.timing); fd.append('quickInfo.duration', form.quickDuration);
      fd.append('quickInfo.difficulty', form.difficulty); fd.append('quickInfo.pickup', form.pickup);
      fd.append('quickInfo.guide', form.guide);
      fd.append('overview.short', form.overviewShort); fd.append('overview.long', form.overviewLong);
      fd.append('highlights', JSON.stringify(form.highlights.split('\n').filter(Boolean)));
      fd.append('inclusions', JSON.stringify(form.inclusions.split('\n').filter(Boolean)));
      fd.append('exclusions', JSON.stringify(form.exclusions.split('\n').filter(Boolean)));
      fd.append('location.address', form.address); fd.append('location.mapUrl', form.mapUrl);
      fd.append('safety', JSON.stringify(form.safety.split('\n').filter(Boolean)));
      fd.append('thingsToCarry', JSON.stringify(form.thingsToCarry.split('\n').filter(Boolean)));
      fd.append('bestTime', form.bestTime);
      fd.append('policies.cancellation', form.cancellation); fd.append('policies.refund', form.refund);
      fd.append('policies.terms', form.terms);
      fd.append('cta.whatsapp', form.whatsapp); fd.append('cta.call', form.call);
      fd.append('cta.buttonText', form.buttonText);
      fd.append('seo.metaTitle', form.metaTitle); fd.append('seo.metaDescription', form.metaDescription);
      fd.append('seo.keywords', JSON.stringify(form.keywords.split(',').map(k => k.trim()).filter(Boolean)));
      fd.append('status', form.status);
      if (heroFile) fd.append('primaryImage', heroFile);
      galleryFiles.forEach(f => fd.append('gallery', f));

      if (mode === 'create') { await activitiesAPI.create(fd); toast.success('Activity created!'); }
      else { await activitiesAPI.update(editId, fd); toast.success('Activity updated!'); }
      setShowDrawer(false); load();
    } catch (err) { toast.error(err?.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this activity?')) return;
    try { await activitiesAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = activities.filter(a =>
    !search || (a.basic?.name || '').toLowerCase().includes(search.toLowerCase()) || (a.activityCode || '').toLowerCase().includes(search.toLowerCase())
  );

  const finalPrice = Math.round(form.price - (form.price * form.discount / 100));

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1>Activities</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Create Activity</button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="search-input">
            <Search size={16} /><input placeholder="Search activities..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="table-count">{filtered.length}</span>
        </div>
        {loading ? <div className="page-loading"><div className="loading-spinner" style={{ width: 28, height: 28 }}></div></div> : (
          <table>
            <thead><tr><th>Code</th><th>Name</th><th>Location</th><th>Duration</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={7}><div className="empty-state"><Mountain size={36} /><p>No activities found</p></div></td></tr> :
                filtered.map(a => (
                  <tr key={a._id}>
                    <td style={{ color: 'var(--gold)', fontWeight: 600, fontSize: 12 }}>{a.activityCode}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {a.hero?.primaryImage && <img src={a.hero.primaryImage} alt="" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />}
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{a.basic?.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.basic?.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>{a.basic?.location || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.basic?.duration || '—'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{(a.basic?.finalPrice || a.basic?.price || 0).toLocaleString()}</td>
                    <td><span className={`badge badge-${(a.meta?.status || '').toLowerCase()}`}><span className="badge-dot"></span>{a.meta?.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => openEdit(a)}><Edit2 size={15} /></button>
                        <button className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(a._id)}><Trash2 size={15} /></button>
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
          <div className="drawer animate-slideInRight" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>{mode === 'create' ? 'Create Activity' : 'Edit Activity'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowDrawer(false)}><X size={20} /></button>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ margin: '0 24px', marginTop: 16 }}>
              {TABS.map((t, i) => (
                <button key={t} className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>{t}</button>
              ))}
            </div>

            <div className="drawer-body">

              {/* ── Tab 0: Basic Info ── */}
              {activeTab === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-row form-grid-2">
                    <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Valley Zipline" /></div>
                    <div className="form-group"><label className="form-label">Slug</label><input className="form-input" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="valley-zipline" /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Tagline</label><input className="form-input" value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Fly over the valley..." /></div>
                  <div className="form-row form-grid-3">
                    <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Duration</label><input className="form-input" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="2 Hours" /></div>
                    <div className="form-group"><label className="form-label">Age Limit</label><input className="form-input" value={form.ageLimit} onChange={e => set('ageLimit', e.target.value)} placeholder="10–60 yrs" /></div>
                  </div>
                  <div className="form-row form-grid-3">
                    <div className="form-group"><label className="form-label">Price (₹)</label><input className="form-input" type="number" value={form.price} onChange={e => set('price', +e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Discount %</label><input className="form-input" type="number" value={form.discount} onChange={e => set('discount', +e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Final Price</label><input className="form-input" disabled value={`₹${finalPrice.toLocaleString()}`} style={{ color: 'var(--gold)', fontWeight: 700 }} /></div>
                  </div>
                  <div className="form-row form-grid-3">
                    <div className="form-group"><label className="form-label">Timing</label><input className="form-input" value={form.timing} onChange={e => set('timing', e.target.value)} placeholder="08:00 AM – 06:00 PM" /></div>
                    <div className="form-group"><label className="form-label">Difficulty</label>
                      <select className="form-select" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                        <option value="">Select</option><option>Easy</option><option>Moderate</option><option>Hard</option><option>Extreme</option>
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">Guide Included</label><input className="form-input" value={form.guide} onChange={e => set('guide', e.target.value)} placeholder="Yes / No" /></div>
                  </div>
                  <div className="form-row form-grid-2">
                    <div className="form-group"><label className="form-label">Pickup Point</label><input className="form-input" value={form.pickup} onChange={e => set('pickup', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Status</label>
                      <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                        <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab 1: Hero & Gallery ── */}
              {activeTab === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-row form-grid-2">
                    <div className="form-group"><label className="form-label">Hero Title</label><input className="form-input" value={form.heroTitle} onChange={e => set('heroTitle', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Hero Subtitle</label><input className="form-input" value={form.heroSubtitle} onChange={e => set('heroSubtitle', e.target.value)} /></div>
                  </div>

                  {/* Hero Image */}
                  <div className="form-group">
                    <label className="form-label">Primary / Hero Image</label>
                    {existingHeroUrl && !heroFile && (
                      <div style={{ marginBottom: 8, borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative' }}>
                        <img src={existingHeroUrl} alt="current hero" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>Current Image</div>
                      </div>
                    )}
                    <div style={{
                      border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: 20,
                      textAlign: 'center', cursor: 'pointer',
                      background: heroFile ? 'var(--success-bg)' : 'var(--bg-primary)'
                    }} onClick={() => document.getElementById('actHero').click()}>
                      <Upload size={18} style={{ color: 'var(--text-muted)' }} />
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{heroFile ? heroFile.name : existingHeroUrl ? 'Click to replace image' : 'Upload hero image'}</p>
                    </div>
                    <input type="file" id="actHero" accept="image/*" hidden onChange={e => setHeroFile(e.target.files[0])} />
                  </div>

                  {/* Gallery Images */}
                  <div className="form-group">
                    <label className="form-label">Gallery Images</label>
                    {existingGallery.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        {existingGallery.map((img, i) => (
                          <div key={i} style={{ position: 'relative' }}>
                            <img src={img.url || img} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                          </div>
                        ))}
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'flex-end', paddingBottom: 4 }}>{existingGallery.length} existing</div>
                      </div>
                    )}
                    <div style={{
                      border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: 20,
                      textAlign: 'center', cursor: 'pointer',
                      background: galleryFiles.length ? 'var(--info-bg)' : 'var(--bg-primary)'
                    }} onClick={() => document.getElementById('actGallery').click()}>
                      <Upload size={18} style={{ color: 'var(--text-muted)' }} />
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        {galleryFiles.length ? `${galleryFiles.length} new files selected` : 'Upload gallery images (max 20)'}
                      </p>
                    </div>
                    <input type="file" id="actGallery" accept="image/*" multiple hidden onChange={e => setGalleryFiles(Array.from(e.target.files))} />
                  </div>
                </div>
              )}

              {/* ── Tab 2: Overview & Info ── */}
              {activeTab === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group"><label className="form-label">Short Overview</label><textarea className="form-textarea" rows={3} value={form.overviewShort} onChange={e => set('overviewShort', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Detailed Overview</label><textarea className="form-textarea" rows={5} value={form.overviewLong} onChange={e => set('overviewLong', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Highlights (one per line)</label><textarea className="form-textarea" rows={4} value={form.highlights} onChange={e => set('highlights', e.target.value)} /></div>
                  <div className="form-row form-grid-2">
                    <div className="form-group"><label className="form-label">Inclusions (one per line)</label><textarea className="form-textarea" rows={4} value={form.inclusions} onChange={e => set('inclusions', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Exclusions (one per line)</label><textarea className="form-textarea" rows={4} value={form.exclusions} onChange={e => set('exclusions', e.target.value)} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Best Time to Visit</label><input className="form-input" value={form.bestTime} onChange={e => set('bestTime', e.target.value)} placeholder="October – March" /></div>
                </div>
              )}

              {/* ── Tab 3: Location & Safety ── */}
              {activeTab === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group"><label className="form-label">Address</label><textarea className="form-textarea" rows={2} value={form.address} onChange={e => set('address', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Google Maps URL</label><input className="form-input" value={form.mapUrl} onChange={e => set('mapUrl', e.target.value)} placeholder="https://maps.google.com/..." /></div>
                  <div className="form-group"><label className="form-label">Safety Instructions (one per line)</label><textarea className="form-textarea" rows={5} value={form.safety} onChange={e => set('safety', e.target.value)} placeholder="Wear a helmet at all times&#10;Listen to the guide" /></div>
                  <div className="form-group"><label className="form-label">Things to Carry (one per line)</label><textarea className="form-textarea" rows={4} value={form.thingsToCarry} onChange={e => set('thingsToCarry', e.target.value)} placeholder="Comfortable shoes&#10;Water bottle&#10;Sunscreen" /></div>
                </div>
              )}

              {/* ── Tab 4: Policies & CTA ── */}
              {activeTab === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group"><label className="form-label">Cancellation Policy</label><textarea className="form-textarea" rows={3} value={form.cancellation} onChange={e => set('cancellation', e.target.value)} /></div>
                  <div className="form-row form-grid-2">
                    <div className="form-group"><label className="form-label">Refund Policy</label><textarea className="form-textarea" rows={3} value={form.refund} onChange={e => set('refund', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Terms & Conditions</label><textarea className="form-textarea" rows={3} value={form.terms} onChange={e => set('terms', e.target.value)} /></div>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: 16 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Call To Action (CTA)</p>
                    <div className="form-row form-grid-3">
                      <div className="form-group"><label className="form-label">WhatsApp No.</label><input className="form-input" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+91-XXXXXXXXXX" /></div>
                      <div className="form-group"><label className="form-label">Call No.</label><input className="form-input" value={form.call} onChange={e => set('call', e.target.value)} placeholder="+91-XXXXXXXXXX" /></div>
                      <div className="form-group"><label className="form-label">Button Text</label><input className="form-input" value={form.buttonText} onChange={e => set('buttonText', e.target.value)} /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab 5: SEO ── */}
              {activeTab === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-row form-grid-2">
                    <div className="form-group"><label className="form-label">Meta Title</label><input className="form-input" value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Keywords (comma separated)</label><input className="form-input" value={form.keywords} onChange={e => set('keywords', e.target.value)} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Meta Description</label><textarea className="form-textarea" rows={4} value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)} /></div>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: 14 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>SEO Preview</p>
                    <p style={{ fontSize: 17, color: '#4a90e2', fontWeight: 600, marginBottom: 2 }}>{form.metaTitle || form.name || 'Activity Title'}</p>
                    <p style={{ fontSize: 13, color: 'var(--success)', marginBottom: 4 }}>goldenhive.in/activities/{form.slug || 'activity-slug'}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{form.metaDescription || 'Meta description will appear here...'}</p>
                  </div>
                </div>
              )}

            </div>
            <div className="drawer-footer">
              <button className="btn btn-secondary" onClick={() => setShowDrawer(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="loading-spinner" /> : null}
                {mode === 'create' ? 'Create Activity' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

