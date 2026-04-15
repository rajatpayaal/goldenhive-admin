import React from 'react'
import { Bell, Command, Menu, Moon, PanelLeftClose, Search, Sun } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useTheme } from '../../context/ThemeContext'

interface NavbarProps {
  collapsed: boolean
  onToggleSidebar: () => void
  onToggleMobile: () => void
  notificationCount?: number
}

const Navbar: React.FC<NavbarProps> = ({ collapsed, onToggleSidebar, onToggleMobile, notificationCount = 0 }) => {
  const { user } = useAuthStore()
  const { resolved, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-surface-border bg-surface/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        onClick={onToggleMobile}
        className="rounded-lg p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={onToggleSidebar}
        className="hidden rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary lg:inline-flex"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <PanelLeftClose className={`h-5 w-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
      </button>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          placeholder="Search users, bookings, packages"
          className="w-full rounded-lg border border-surface-border bg-surface-card/60 py-2 pl-9 pr-3 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-lg border border-surface-border bg-surface-card/60 px-2.5 py-1.5 text-xs text-text-secondary md:flex">
          <Command className="h-3.5 w-3.5" />
          <span>Quick Actions</span>
        </div>

        <button
          type="button"
          onClick={toggle}
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          title={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {resolved === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <a
          href="/notifications"
          className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-surface" />
          )}
        </a>

        <div className="flex items-center gap-2 border-l border-surface-border pl-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 text-xs font-bold text-white">
            {user?.firstName?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-tight text-text-primary">
              {user?.firstName || 'Admin'} {user?.lastName || ''}
            </p>
            <p className="text-[10px] text-text-tertiary">{String(user?.role || 'ADMIN').toUpperCase()}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
