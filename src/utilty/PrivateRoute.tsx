import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

type PrivateRouteProps = {
  allowedRoles?: string[]
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles?.length && user) {
    const currentRole = String(user?.role || '').toUpperCase()
    const isAllowed = allowedRoles
      .map((role) => String(role).toUpperCase())
      .includes(currentRole)

    if (!isAllowed) {
      return <Navigate to="/login" replace />
    }
  }

  return <Outlet />
}

export default PrivateRoute
