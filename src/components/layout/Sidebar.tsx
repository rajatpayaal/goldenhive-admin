import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  Users,
  Bell,
  LogOut,
  ChevronRight,
  Palmtree,
  BarChart3,
  Settings,
  X,
  Shapes,
  MapPin,
  Map,
  Navigation,
  NotebookPen,
  Megaphone,
  TicketPercent,
  MessagesSquare,
  Star,
  CircleHelp,
  ClipboardList,
  MessageSquareQuote,
  MessageSquare,
  FileText,
  LayoutTemplate,
  ShieldAlert,
  Shield,
  ArrowDownToLine,
  Banknote,
  CarFront,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import brandIcon from '../../assets/icongoldenhive.png'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', to: '/', icon: LayoutDashboard },
      { label: 'Analytics', to: '/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Users', to: '/users', icon: Users },
      { label: 'Bookings', to: '/bookings', icon: CalendarCheck },
      { label: 'Packages', to: '/packages', icon: Package },
      { label: 'Package Pricing', to: '/package-pricing', icon: Banknote },
      { label: 'Vehicles', to: '/vehicles', icon: CarFront },
      { label: 'Countries', to: '/countries', icon: Navigation },
      { label: 'States', to: '/states', icon: Map },
      { label: 'Cities', to: '/cities', icon: MapPin },
      { label: 'Categories', to: '/categories', icon: Shapes },
      { label: 'Blogs', to: '/blogs', icon: NotebookPen },
      { label: 'Banners', to: '/banners', icon: Megaphone },
      { label: 'Discounts', to: '/discounts', icon: TicketPercent },
      { label: 'Support', to: '/support', icon: MessagesSquare },
      { label: 'Custom Requests', to: '/custom-requests', icon: ClipboardList },
      { label: 'Feedback', to: '/feedback', icon: MessageSquare },
      { label: 'About Us', to: '/about-us', icon: NotebookPen },
      { label: 'Policies', to: '/policies', icon: Shield },
      { label: 'Footer CMS', to: '/footer', icon: ArrowDownToLine },
      { label: 'Reviews', to: '/reviews', icon: Star },
      { label: 'FAQs', to: '/faqs', icon: CircleHelp },
      { label: 'AI Chatbot', to: '/chatbot', icon: MessageSquareQuote },
      { label: 'Notifications', to: '/notifications', icon: Bell },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Policies', to: '/policies', icon: FileText },
      { label: 'Footer CMS', to: '/footer', icon: LayoutTemplate },
      { label: 'Error Logs', to: '/error-logs', icon: ShieldAlert },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, mobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const currentRole = String(user?.role || 'ADMIN').toUpperCase()

  const railWidth = collapsed ? 'lg:w-[88px]' : 'lg:w-[280px]'

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onCloseMobile}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[280px] flex-col border-r border-surface-border bg-surface shadow-lg transition-transform duration-300 lg:translate-x-0 ${railWidth} ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center gap-3 border-b border-surface-border px-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-border bg-surface-card">
            <img src={brandIcon} alt="Goldenhive" className="h-8 w-8 object-contain" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-text-primary">Goldenhive Admin</p>
              <p className="text-xs text-text-tertiary">Control Center</p>
            </div>
          )}
          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-auto rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="border-b border-surface-border px-4 py-3">
          {!collapsed && user && (
            <>
              <p className="truncate text-sm font-semibold text-text-primary">
                {user.firstName} {user.lastName}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-success-500/15 px-2.5 py-1 text-[10px] font-semibold text-success-700">
                  {currentRole}
                </span>
                <span className="truncate text-xs text-text-tertiary">{user.email}</span>
              </div>
            </>
          )}
          {collapsed && (
            <div className="mx-auto h-9 w-9 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 text-center text-sm font-bold leading-9 text-white">
              {user?.firstName?.[0]?.toUpperCase() || 'A'}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  {group.label}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map(({ label, to, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === '/'}
                      onClick={onCloseMobile}
                      title={collapsed ? label : undefined}
                      className={({ isActive: active }) =>
                        `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                          active
                            ? 'border border-primary-500/30 bg-primary-500/15 text-primary-700'
                            : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                        }`
                      }
                    >
                      {({ isActive: active }) => (
                        <>
                          <Icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span className="flex-1">{label}</span>}
                          {!collapsed && active && <ChevronRight className="h-3.5 w-3.5 text-primary-600" />}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-surface-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-all hover:bg-danger-500/15 hover:text-danger-600"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
