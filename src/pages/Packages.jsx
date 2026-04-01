import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Upload, Loader2, Package } from 'lucide-react';
import { packagesAPI } from '../api/endpoints';
import toast from 'react-hot-toast';

const TABS = ['Basic Info', 'Hero & Gallery', 'Overview', 'Itinerary', 'Pricing', 'Hotel & Travel', 'SEO & Policies'];

const emptyForm = {
  name: '', slug: '', tagline: '', destination: '', durationDays: 1, nights: 0,
  basePrice: 0, discount: 0, currency: 'INR', tags: '',
  heroTitle: '', heroSubtitle: '', badges: '', ctaText: 'Book Now',
  pickup: '', drop: '', meals: '', stay: '', transport: '', difficulty: 'Easy',
  overviewShort: '', overviewLong: '',
  whyChooseUs: '', highlights: '', inclusions: '', exclusions: '',
  itinerary: '[]',
  taxesIncluded: true, nextSlots: '', seatsLeft: 0,
  hotelDetails: '[]',
  bestTime: '', temperature: '', clothing: '',
  reviews: '[]', faq: '[]',
  cancellation: '', refund: '', terms: '',
  whatsapp: '', call: '', buttonText: 'Book Now', sticky: true,
  metaTitle: '', metaDescription: '', keywords: '',
  status: 'ACTIVE',
};

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState('create');
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [heroFile, setHeroFile] = useState(null);
  const [existingHeroUrl, setExistingHeroUrl] = useState('');
  const [existingGallery, setExistingGallery] = useState([]);

  useEffect(() => { loadPackages(); }, []);

  const loadPackages = async () => {
    try {
      const res = await packagesAPI.list();
      setPackages(res.data.data || []);
    } catch { toast.error('Failed to load packages'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDrawerMode('create');
    setActiveTab(0);
    setGalleryFiles([]);
    setHeroFile(null);
    setExistingHeroUrl('');
    setExistingGallery([]);
    setShowDrawer(true);
  };

  const openEdit = (pkg) => {
    setForm({
      name: pkg.basic?.name || '', slug: pkg.basic?.slug || '', tagline: pkg.basic?.tagline || '',
      destination: pkg.basic?.destination || '',
      durationDays: pkg.basic?.durationDays || 1, nights: pkg.basic?.nights || 0,
      basePrice: pkg.basic?.basePrice || 0, discount: pkg.basic?.discount || 0,
      currency: pkg.basic?.currency || 'INR',
      tags: (pkg.basic?.tags || []).join(', '),
      heroTitle: pkg.hero?.title || '', heroSubtitle: pkg.hero?.subtitle || '',
      badges: (pkg.hero?.badges || []).join(', '), ctaText: pkg.hero?.ctaText || 'Book Now',
      pickup: pkg.quickInfo?.pickup || '', drop: pkg.quickInfo?.drop || '',
      meals: pkg.quickInfo?.meals || '', stay: pkg.quickInfo?.stay || '',
      transport: pkg.quickInfo?.transport || '', difficulty: pkg.quickInfo?.difficulty || 'Easy',
      overviewShort: pkg.overview?.short || '', overviewLong: pkg.overview?.long || '',
      whyChooseUs: (pkg.whyChooseUs || []).join('\n'),
      highlights: (pkg.highlights || []).join('\n'),
      inclusions: (pkg.inclusions || []).join('\n'),
      exclusions: (pkg.exclusions || []).join('\n'),
      itinerary: JSON.stringify(pkg.itinerary || [], null, 2),
      taxesIncluded: pkg.pricing?.taxesIncluded ?? true,
      nextSlots: (pkg.availability?.nextSlots || []).join(', '),
      seatsLeft: pkg.availability?.seatsLeft || 0,
      hotelDetails: JSON.stringify(pkg.hotelDetails || [], null, 2),
      bestTime: pkg.travelInfo?.bestTime || '', temperature: pkg.travelInfo?.temperature || '',
      clothing: pkg.travelInfo?.clothing || '',
      reviews: JSON.stringify(pkg.reviews || [], null, 2),
      faq: JSON.stringify(pkg.faq || [], null, 2),
      cancellation: pkg.policies?.cancellation || '', refund: pkg.policies?.refund || '',
      terms: pkg.policies?.terms || '',
      whatsapp: pkg.cta?.whatsapp || '', call: pkg.cta?.call || '',
      buttonText: pkg.cta?.buttonText || 'Book Now', sticky: pkg.cta?.sticky ?? true,
      metaTitle: pkg.seo?.metaTitle || '', metaDescription: pkg.seo?.metaDescription || '',
      keywords: (pkg.seo?.keywords || []).join(', '),
      status: pkg.meta?.status || 'ACTIVE',
    });
    setEditId(pkg._id);
    setDrawerMode('edit');
    setActiveTab(0);
    setGalleryFiles([]);
    setHeroFile(null);
    setExistingHeroUrl(pkg.hero?.primaryImage || '');
    setExistingGallery(pkg.gallery || []);
    setShowDrawer(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('slug', form.slug || form.name.toLowerCase().replace(/\s+/g, '-'));
      fd.append('tagline', form.tagline);
      fd.append('destination', form.destination);
      fd.append('durationDays', form.durationDays);
      fd.append('nights', form.nights);
      fd.append('basePrice', form.basePrice);
      fd.append('discount', form.discount);
      fd.append('currency', form.currency);
      fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      fd.append('hero.title', form.heroTitle);
      fd.append('hero.subtitle', form.heroSubtitle);
      fd.append('hero.badges', JSON.stringify(form.badges.split(',').map(b => b.trim()).filter(Boolean)));
      fd.append('hero.ctaText', form.ctaText);
      fd.append('quickInfo.pickup', form.pickup);
      fd.append('quickInfo.drop', form.drop);
      fd.append('quickInfo.meals', form.meals);
      fd.append('quickInfo.stay', form.stay);
      fd.append('quickInfo.transport', form.transport);
      fd.append('quickInfo.difficulty', form.difficulty);
      fd.append('overview.short', form.overviewShort);
      fd.append('overview.long', form.overviewLong);
      fd.append('whyChooseUs', JSON.stringify(form.whyChooseUs.split('\n').filter(Boolean)));
      fd.append('highlights', JSON.stringify(form.highlights.split('\n').filter(Boolean)));
      fd.append('inclusions', JSON.stringify(form.inclusions.split('\n').filter(Boolean)));
      fd.append('exclusions', JSON.stringify(form.exclusions.split('\n').filter(Boolean)));
      fd.append('itinerary', form.itinerary);
      fd.append('pricing.taxesIncluded', form.taxesIncluded);
      fd.append('availability.nextSlots', JSON.stringify(form.nextSlots.split(',').map(s => s.trim()).filter(Boolean)));
      fd.append('availability.seatsLeft', form.seatsLeft);
      fd.append('hotelDetails', form.hotelDetails);
      fd.append('travelInfo.bestTime', form.bestTime);
      fd.append('travelInfo.temperature', form.temperature);
      fd.append('travelInfo.clothing', form.clothing);
      fd.append('faq', form.faq);
      fd.append('policies.cancellation', form.cancellation);
      fd.append('policies.refund', form.refund);
      fd.append('policies.terms', form.terms);
      fd.append('cta.whatsapp', form.whatsapp);
      fd.append('cta.call', form.call);
      fd.append('cta.buttonText', form.buttonText);
      fd.append('cta.sticky', form.sticky);
      fd.append('seo.metaTitle', form.metaTitle);
      fd.append('seo.metaDescription', form.metaDescription);
      fd.append('seo.keywords', JSON.stringify(form.keywords.split(',').map(k => k.trim()).filter(Boolean)));
      fd.append('status', form.status);

      if (heroFile) fd.append('primaryImage', heroFile);
      galleryFiles.forEach(f => fd.append('gallery', f));

      if (drawerMode === 'create') {
        await packagesAPI.create(fd);
        toast.success('Package created!');
      } else {
        await packagesAPI.update(editId, fd);
        toast.success('Package updated!');
      }
      setShowDrawer(false);
      loadPackages();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this package permanently?')) return;
    try {
      await packagesAPI.delete(id);
      toast.success('Package deleted');
      loadPackages();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = packages.filter(p => {
    const matchSearch = !search || (p.basic?.name || '').toLowerCase().includes(search.toLowerCase())
      || (p.packageCode || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || p.meta?.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1>Packages</h1>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Create Package
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-header-left">
            <div className="search-input">
              <Search size={16} />
              <input placeholder="Search packages..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '8px 32px 8px 12px', fontSize: 13 }}>
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <span className="table-count">{filtered.length} packages</span>
        </div>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner" style={{ width: 28, height: 28 }}></div></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Package Name</th>
                <th>Destination</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><Package size={36} /><p>No packages found</p></div></td></tr>
              ) : filtered.map(pkg => (
                <tr key={pkg._id}>
                  <td style={{ color: 'var(--gold)', fontWeight: 600, fontSize: 12 }}>{pkg.packageCode}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {pkg.hero?.primaryImage && (
                        <img src={pkg.hero.primaryImage} alt=""
                          style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                      )}
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pkg.basic?.name || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pkg.basic?.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>{pkg.basic?.destination || '—'}</td>
                  <td>{pkg.basic?.durationDays || 0}D / {pkg.basic?.nights || 0}N</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    ₹{(pkg.basic?.finalPrice || pkg.basic?.basePrice || 0).toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge badge-${(pkg.meta?.status || '').toLowerCase()}`}>
                      <span className="badge-dot"></span>
                      {pkg.meta?.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon" onClick={() => openEdit(pkg)} title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(pkg._id)} title="Delete"
                        style={{ color: 'var(--danger)' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Drawer */}
      {showDrawer && (
        <div className="drawer-overlay animate-fadeIn" onClick={() => setShowDrawer(false)}>
          <div className="drawer animate-slideInRight" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>{drawerMode === 'create' ? 'Create Package' : 'Edit Package'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowDrawer(false)}><X size={20} /></button>
            </div>

            <div className="tabs" style={{ margin: '0 24px', marginTop: 16 }}>
              {TABS.map((t, i) => (
                <button key={t} className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
                  {t}
                </button>
              ))}
            </div>

            <div className="drawer-body">
              {activeTab === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-row form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Name *</label>
                      <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Kedarkantha Trek" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Slug</label>
                      <input className="form-input" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="kedarkantha-trek" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tagline</label>
                    <input className="form-input" value={form.tagline} onChange={e => set('tagline', e.target.value)} />
                  </div>
                  <div className="form-row form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Destination *</label>
                      <input className="form-input" value={form.destination} onChange={e => set('destination', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Days</label>
                      <input className="form-input" type="number" value={form.durationDays} onChange={e => set('durationDays', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nights</label>
                      <input className="form-input" type="number" value={form.nights} onChange={e => set('nights', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-row form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Tags (comma separated)</label>
                      <input className="form-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="trekking, adventure" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Pickup</label>
                      <input className="form-input" value={form.pickup} onChange={e => set('pickup', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Drop</label>
                      <input className="form-input" value={form.drop} onChange={e => set('drop', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Difficulty</label>
                      <select className="form-select" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                        <option>Easy</option><option>Moderate</option><option>Hard</option><option>Extreme</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Meals</label>
                      <input className="form-input" value={form.meals} onChange={e => set('meals', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Stay</label>
                      <input className="form-input" value={form.stay} onChange={e => set('stay', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Transport</label>
                      <input className="form-input" value={form.transport} onChange={e => set('transport', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-row form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Hero Title</label>
                      <input className="form-input" value={form.heroTitle} onChange={e => set('heroTitle', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hero Subtitle</label>
                      <input className="form-input" value={form.heroSubtitle} onChange={e => set('heroSubtitle', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Primary Image</label>
                    {existingHeroUrl && !heroFile && (
                      <div style={{ marginBottom: 8, borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative' }}>
                        <img src={existingHeroUrl} alt="current hero" style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>Current Image</div>
                      </div>
                    )}
                    <div style={{
                      border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
                      padding: 20, textAlign: 'center', cursor: 'pointer',
                      background: heroFile ? 'var(--success-bg)' : 'var(--bg-primary)'
                    }} onClick={() => document.getElementById('heroInput').click()}>
                      <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: 6 }} />
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {heroFile ? heroFile.name : existingHeroUrl ? 'Click to replace image' : 'Click to upload hero image'}
                      </p>
                    </div>
                    <input type="file" id="heroInput" accept="image/*" hidden onChange={e => setHeroFile(e.target.files[0])} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gallery Images</label>
                    {existingGallery.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        {existingGallery.slice(0, 8).map((img, i) => (
                          <img key={i} src={img.url || img} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                        ))}
                        {existingGallery.length > 8 && <div style={{ width: 64, height: 64, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>+{existingGallery.length - 8}</div>}
                      </div>
                    )}
                    <div style={{
                      border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
                      padding: 20, textAlign: 'center', cursor: 'pointer',
                      background: galleryFiles.length ? 'var(--info-bg)' : 'var(--bg-primary)'
                    }} onClick={() => document.getElementById('galleryInput').click()}>
                      <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: 6 }} />
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {galleryFiles.length ? `${galleryFiles.length} new files selected` : existingGallery.length ? `Click to add/replace gallery (${existingGallery.length} existing)` : 'Click to upload gallery images (max 20)'}
                      </p>
                    </div>
                    <input type="file" id="galleryInput" accept="image/*" multiple hidden
                      onChange={e => setGalleryFiles(Array.from(e.target.files))} />
                  </div>
                  <div className="form-row form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Badges (comma separated)</label>
                      <input className="form-input" value={form.badges} onChange={e => set('badges', e.target.value)} placeholder="Best Seller, Trending" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CTA Text</label>
                      <input className="form-input" value={form.ctaText} onChange={e => set('ctaText', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Short Overview</label>
                    <textarea className="form-textarea" rows={3} value={form.overviewShort} onChange={e => set('overviewShort', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Detailed Overview</label>
                    <textarea className="form-textarea" rows={5} value={form.overviewLong} onChange={e => set('overviewLong', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Why Choose Us (one per line)</label>
                    <textarea className="form-textarea" rows={4} value={form.whyChooseUs} onChange={e => set('whyChooseUs', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Highlights (one per line)</label>
                    <textarea className="form-textarea" rows={4} value={form.highlights} onChange={e => set('highlights', e.target.value)} />
                  </div>
                  <div className="form-row form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Inclusions (one per line)</label>
                      <textarea className="form-textarea" rows={4} value={form.inclusions} onChange={e => set('inclusions', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Exclusions (one per line)</label>
                      <textarea className="form-textarea" rows={4} value={form.exclusions} onChange={e => set('exclusions', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Itinerary (JSON Array)</label>
                    <textarea className="form-textarea" rows={12} value={form.itinerary} onChange={e => set('itinerary', e.target.value)}
                      placeholder='[{"day":1,"title":"Day 1 - Arrival","meals":"Dinner","stay":"Camp","description":"..."}]'
                      style={{ fontFamily: 'monospace', fontSize: 12 }}
                    />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Each item: {`{ "day": 1, "title": "...", "meals": "...", "stay": "...", "description": "..." }`}
                  </p>
                </div>
              )}

              {activeTab === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-row form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Base Price (₹)</label>
                      <input className="form-input" type="number" value={form.basePrice} onChange={e => set('basePrice', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Discount %</label>
                      <input className="form-input" type="number" value={form.discount} onChange={e => set('discount', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Final Price</label>
                      <input className="form-input" disabled
                        value={`₹${Math.round(form.basePrice - (form.basePrice * form.discount / 100)).toLocaleString()}`}
                        style={{ color: 'var(--gold)', fontWeight: 700 }}
                      />
                    </div>
                  </div>
                  <div className="form-row form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Currency</label>
                      <input className="form-input" value={form.currency} onChange={e => set('currency', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 24 }}>
                      <input type="checkbox" checked={form.taxesIncluded} onChange={e => set('taxesIncluded', e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: 'var(--gold)' }} />
                      <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Taxes Included</label>
                    </div>
                  </div>
                  <div className="form-row form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Next Available Slots (comma-separated dates)</label>
                      <input className="form-input" value={form.nextSlots} onChange={e => set('nextSlots', e.target.value)} placeholder="2026-05-01, 2026-05-15" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Seats Left</label>
                      <input className="form-input" type="number" value={form.seatsLeft} onChange={e => set('seatsLeft', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Hotel Details (JSON)</label>
                    <textarea className="form-textarea" rows={4} value={form.hotelDetails} onChange={e => set('hotelDetails', e.target.value)}
                      style={{ fontFamily: 'monospace', fontSize: 12 }} />
                  </div>
                  <div className="form-row form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Best Time to Visit</label>
                      <input className="form-input" value={form.bestTime} onChange={e => set('bestTime', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Temperature</label>
                      <input className="form-input" value={form.temperature} onChange={e => set('temperature', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Clothing</label>
                      <input className="form-input" value={form.clothing} onChange={e => set('clothing', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">FAQ (JSON)</label>
                    <textarea className="form-textarea" rows={4} value={form.faq} onChange={e => set('faq', e.target.value)}
                      style={{ fontFamily: 'monospace', fontSize: 12 }} />
                  </div>
                </div>
              )}

              {activeTab === 6 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-row form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Meta Title</label>
                      <input className="form-input" value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Keywords (comma separated)</label>
                      <input className="form-input" value={form.keywords} onChange={e => set('keywords', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meta Description</label>
                    <textarea className="form-textarea" rows={3} value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cancellation Policy</label>
                    <textarea className="form-textarea" rows={3} value={form.cancellation} onChange={e => set('cancellation', e.target.value)} />
                  </div>
                  <div className="form-row form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Refund Policy</label>
                      <textarea className="form-textarea" rows={3} value={form.refund} onChange={e => set('refund', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Terms</label>
                      <textarea className="form-textarea" rows={3} value={form.terms} onChange={e => set('terms', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-row form-grid-3">
                    <div className="form-group">
                      <label className="form-label">WhatsApp</label>
                      <input className="form-input" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Call</label>
                      <input className="form-input" value={form.call} onChange={e => set('call', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Button Text</label>
                      <input className="form-input" value={form.buttonText} onChange={e => set('buttonText', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <button className="btn btn-secondary" onClick={() => setShowDrawer(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="loading-spinner" /> : null}
                {drawerMode === 'create' ? 'Create Package' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

