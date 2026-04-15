import { Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ title }) {
  const { user } = useAuth();
  const initials = (user?.fullName || user?.email || 'A').slice(0, 2).toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title || 'Dashboard'}</h1>
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <Search size={16} />
          <input placeholder="Search anything..." />
          <kbd>⌘K</kbd>
        </div>
        <button className="topbar-icon-btn">
          <Bell size={18} />
          <span className="badge"></span>
        </button>
        <div className="topbar-avatar" title={user?.email || 'Admin'}>
          {initials}
        </div>
      </div>
    </header>
  );
}
