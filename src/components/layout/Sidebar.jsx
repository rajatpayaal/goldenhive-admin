import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Mountain, CalendarCheck, Users, Image, MessageSquare,
  Star, Film, Clock, Link2, Settings, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { section: 'Main' },
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { section: 'Catalog' },
  { path: '/packages', icon: Package, label: 'Packages' },
  { path: '/activities', icon: Mountain, label: 'Activities' },
  { path: '/mappings', icon: Link2, label: 'Pkg ↔ Activity' },
  { path: '/activity-slots', icon: Clock, label: 'Activity Slots' },
  { section: 'Operations' },
  { path: '/bookings', icon: CalendarCheck, label: 'Bookings' },
  { path: '/custom-requests', icon: MessageSquare, label: 'Custom Requests' },
  { section: 'Content' },
  { path: '/banners', icon: Image, label: 'Banners' },
  { path: '/home-media', icon: Film, label: 'Home Media' },
  { path: '/reviews', icon: Star, label: 'Reviews' },
  { section: 'System' },
  { path: '/users', icon: Users, label: 'Users' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="sidebar-logo">
        <div className="logo-icon">GH</div>
        {!collapsed && (
          <div className="logo-text">
            Golden<span>Hive</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            if (collapsed) return null;
            return <div key={i} className="sidebar-section-title">{item.section}</div>;
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive && (item.path === '/' ? location.pathname === '/' : true) ? 'active' : ''}`
              }
              end={item.path === '/'}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span className="link-text">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <button className="sidebar-link" onClick={logout} style={{ width: '100%', color: 'var(--danger)' }}>
          <LogOut size={20} />
          {!collapsed && <span className="link-text">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
