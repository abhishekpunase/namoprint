import { ChevronRight, Download, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'

const formatDate = () =>
  new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

export function DashboardHeader({ onRefresh, onExport, refreshing = false }) {
  const { user } = useAuth()

  return (
    <header className="dash-header">
      <div className="dash-header__copy">
        <nav className="dash-breadcrumb" aria-label="Breadcrumb">
          <Link to="/admin">Admin</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span aria-current="page">Dashboard</span>
        </nav>
        <h1 className="dash-header__title">Dashboard</h1>
        <p className="dash-header__welcome">
          Welcome back, <strong>{user?.name || 'Admin'}</strong> · {formatDate()}
        </p>
      </div>

      <div className="dash-header__actions">
        <button
          type="button"
          className="dash-btn dash-btn--ghost"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh dashboard"
        >
          <RefreshCw size={16} className={refreshing ? 'is-spinning' : ''} />
          Refresh
        </button>
        <button type="button" className="dash-btn dash-btn--primary" onClick={onExport}>
          <Download size={16} />
          Export
        </button>
      </div>
    </header>
  )
}
