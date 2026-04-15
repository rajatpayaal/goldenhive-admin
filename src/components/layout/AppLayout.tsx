import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="flex min-h-screen">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div
          className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ${
            collapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'
          }`}
        >
          <Navbar
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((prev) => !prev)}
            onToggleMobile={() => setMobileOpen((prev) => !prev)}
          />

          <main className="flex-1 overflow-auto px-4 pb-6 pt-4 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
