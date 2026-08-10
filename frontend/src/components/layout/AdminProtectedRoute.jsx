import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function AdminProtectedRoute({ children }) {
  const { user, isAuthenticated, booting } = useAuth()
  const location = useLocation()

  if (booting) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400">
        <p className="rounded-xl bg-white/90 px-6 py-4 text-sm font-medium text-gray-700 shadow-lg">
          Loading admin session…
        </p>
      </section>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
          reason: isAuthenticated ? 'admin_required' : undefined,
        }}
      />
    )
  }

  return children
}
