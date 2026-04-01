import { useState, useEffect } from 'react';
import { Search, Star, MessageSquare, Trash2, X } from 'lucide-react';
import { reviewsAPI, packagesAPI } from '../api/endpoints';
import toast from 'react-hot-toast';

export default function Reviews() {
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState('');

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const r = await packagesAPI.list();
      setPackages(r.data.data || []);
    } catch { toast.error('Failed to load packages'); }
    finally { setPkgLoading(false); }
  };

  const loadReviews = async (pkgId) => {
    if (!pkgId) { setReviews([]); return; }
    setLoading(true);
    try {
      const r = await reviewsAPI.listByPackage(pkgId);
      setReviews(r.data.data || []);
    } catch { toast.error('Failed to load reviews'); setReviews([]); }
    finally { setLoading(false); }
  };

  const handlePkgChange = (pkgId) => {
    setSelectedPkg(pkgId);
    setSearch('');
    setFilterRating('');
    loadReviews(pkgId);
  };

  const renderStars = (n, size = 14) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={size} fill={i < n ? 'var(--gold)' : 'none'} color={i < n ? 'var(--gold)' : 'var(--border)'} />
  ));

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const filtered = reviews.filter(r => {
    const matchSearch = !search || (r.comment || '').toLowerCase().includes(search.toLowerCase());
    const matchRating = !filterRating || r.rating === Number(filterRating);
    return matchSearch && matchRating;
  });

  const selectedPkgName = packages.find(p => p._id === selectedPkg)?.basic?.name || '';

  return (
    <div className="animate-fadeIn">
      <div className="page-header"><h1>Reviews</h1></div>

      {/* Package Selector */}
      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
          Select a package to view its reviews
        </p>
        {pkgLoading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading packages...</div>
        ) : (
          <select
            className="form-select"
            value={selectedPkg}
            onChange={e => handlePkgChange(e.target.value)}
            style={{ maxWidth: 480 }}
          >
            <option value="">— Choose a Package —</option>
            {packages.map(p => (
              <option key={p._id} value={p._id}>
                {p.basic?.name} {p.packageCode ? `(${p.packageCode})` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Stats Row */}
      {selectedPkg && !loading && reviews.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="card" style={{ flex: '1 1 160px', textAlign: 'center', padding: '16px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>{avgRating}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 2, margin: '4px 0' }}>{renderStars(Math.round(avgRating), 16)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avg Rating</div>
          </div>
          <div className="card" style={{ flex: '1 1 160px', textAlign: 'center', padding: '16px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{reviews.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Total Reviews</div>
          </div>
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => r.rating === star).length;
            const pct = reviews.length ? Math.round(count / reviews.length * 100) : 0;
            return (
              <div key={star} className="card" style={{ flex: '1 1 140px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  {renderStars(star, 12)}
                </div>
                <div style={{ background: 'var(--bg-elevated)', borderRadius: 4, height: 6, marginBottom: 4 }}>
                  <div style={{ background: 'var(--gold)', width: `${pct}%`, height: '100%', borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count} ({pct}%)</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reviews Table */}
      {selectedPkg && (
        <div className="table-container">
          <div className="table-header">
            <div className="table-header-left">
              <div className="search-input" style={{ maxWidth: 260 }}>
                <Search size={16} />
                <input
                  placeholder="Search in comments..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                value={filterRating}
                onChange={e => setFilterRating(e.target.value)}
                style={{ padding: '8px 32px 8px 12px', fontSize: 13 }}
              >
                <option value="">All Ratings</option>
                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <span className="table-count">{filtered.length} reviews</span>
          </div>

          {loading ? (
            <div className="page-loading"><div className="loading-spinner" style={{ width: 28, height: 28 }}></div></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4}>
                    <div className="empty-state">
                      <MessageSquare size={36} />
                      <p>{reviews.length === 0 ? `No reviews yet for "${selectedPkgName}"` : 'No reviews match your filter'}</p>
                    </div>
                  </td></tr>
                ) : filtered.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.userId || '—'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 2 }}>{renderStars(r.rating)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.rating}/5</div>
                    </td>
                    <td style={{ maxWidth: 340 }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{r.comment || '—'}</p>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!selectedPkg && !pkgLoading && (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <Star size={48} style={{ color: 'var(--gold)', opacity: 0.4 }} />
          <p style={{ marginTop: 12 }}>Select a package above to view its reviews</p>
        </div>
      )}
    </div>
  );
}

