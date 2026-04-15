import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import Activities from './pages/Activities';
import Bookings from './pages/Bookings';
import UserManagement from './pages/UserManagement';
import Banners from './pages/Banners';
import CustomRequests from './pages/CustomRequests';
import Reviews from './pages/Reviews';
import HomeMedia from './pages/HomeMedia';
import ActivitySlots from './pages/ActivitySlots';
import Mappings from './pages/Mappings';
import Settings from './pages/Settings';
import './index.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg-base)' }}><div className="loading-spinner" style={{width:32,height:32}}></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="packages" element={<Packages />} />
        <Route path="activities" element={<Activities />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="banners" element={<Banners />} />
        <Route path="custom-requests" element={<CustomRequests />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="home-media" element={<HomeMedia />} />
        <Route path="activity-slots" element={<ActivitySlots />} />
        <Route path="mappings" element={<Mappings />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '10px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#f59e0b', secondary: '#000' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
