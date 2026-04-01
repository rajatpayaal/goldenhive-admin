import { useState, useEffect } from 'react';
import { Search, Users as UsersIcon, Shield, ShieldCheck, UserCheck } from 'lucide-react';
import { usersAPI } from '../api/endpoints';
import toast from 'react-hot-toast';

const ROLES = ['USER', 'ADMIN', 'SALES_AGENT'];
const ROLE_ICON = { USER: UserCheck, ADMIN: ShieldCheck, SALES_AGENT: Shield };
const ROLE_COLOR = { USER: 'var(--info)', ADMIN: 'var(--danger)', SALES_AGENT: 'var(--warning)' };
const ROLE_BG = { USER: '#3b82f61a', ADMIN: '#ef44441a', SALES_AGENT: '#f59e0b1a' };

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function AvatarBubble({ name, role }) {
  const colors = { USER: '#3b82f6', ADMIN: '#ef4444', SALES_AGENT: '#f59e0b' };
  const bg = colors[role] || '#64748b';
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', background: `${bg}22`,
      border: `2px solid ${bg}44`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 13, fontWeight: 700, color: bg, flexShrink: 0,
    }}>
      {getInitials(name)}
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const r = await usersAPI.list(); setUsers(r.data.data || []); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const changeRole = async (id, role) => {
    if (!confirm(`Change this user's role to ${role}?`)) return;
    setUpdatingId(id);
    try {
      await usersAPI.updateRole(id, { role });
      toast.success(`Role updated to ${role}`);
      load();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed'); }
    finally { setUpdatingId(null); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.userName || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const counts = {};
  users.forEach(u => { counts[u.role] = (counts[u.role] || 0) + 1; });

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1>User Management</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {Object.entries(counts).map(([role, count]) => {
            const RIcon = ROLE_ICON[role] || UserCheck;
            return (
              <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: 12, color: ROLE_COLOR[role], background: ROLE_BG[role] }}>
                <RIcon size={13} /> {role}: {count}
              </div>
            );
          })}
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-header-left">
            <div className="search-input">
              <Search size={16} />
              <input placeholder="Search by name, email, username..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ padding: '8px 32px 8px 12px', fontSize: 13 }}>
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <span className="table-count">{filtered.length} users</span>
        </div>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner" style={{ width: 28, height: 28 }}></div></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state"><UsersIcon size={36} /><p>No users found</p></div>
                </td></tr>
              ) : filtered.map(u => {
                const RIcon = ROLE_ICON[u.role] || UserCheck;
                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AvatarBubble name={u.fullName} role={u.role} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.fullName || '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{u.userName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.phone || '—'}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 10px', borderRadius: 'var(--radius-full)',
                        fontSize: 11, fontWeight: 700,
                        background: ROLE_BG[u.role], color: ROLE_COLOR[u.role],
                      }}>
                        <RIcon size={12} />{u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <select
                        className="form-select"
                        value={u.role}
                        onChange={e => changeRole(u._id, e.target.value)}
                        disabled={updatingId === u._id}
                        style={{ padding: '5px 28px 5px 8px', fontSize: 12, background: 'var(--bg-elevated)', opacity: updatingId === u._id ? 0.5 : 1 }}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

