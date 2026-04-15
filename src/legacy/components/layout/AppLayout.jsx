import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageTitles = {
  '/': 'Dashboard',
  '/packages': 'Packages',
  '/activities': 'Activities',
  '/bookings': 'Bookings',
  '/users': 'Users',
  '/banners': 'Banners',
  '/custom-requests': 'Custom Requests',
  '/reviews': 'Reviews',
  '/home-media': 'Home Media',
  '/activity-slots': 'Activity Slots',
  '/mappings': 'Package ↔ Activity Mappings',
  '/settings': 'Settings',
};

export default function AppLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Admin Panel';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Topbar title={title} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
