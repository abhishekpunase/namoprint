import { Activity, AlertTriangle, CheckCircle, Server } from 'lucide-react'

const STATUS_ICON = {
  healthy: CheckCircle,
  warning: AlertTriangle,
  critical: AlertTriangle,
  offline: Server,
  todo: Activity,
}

export function SystemMonitoringPanel({ health, serverLogs, loading }) {
  if (loading || !health) {
    return <div className="sys-dashboard">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="sys-stat-card sys-skeleton" />)}</div>
  }

  const cards = [
    { label: 'CPU Usage', value: `${health.cpu}%`, status: health.cpu > 80 ? 'warning' : 'healthy' },
    { label: 'RAM Usage', value: `${health.ram}%`, status: health.ram > 85 ? 'warning' : 'healthy' },
    { label: 'Disk Usage', value: `${health.disk}%`, status: 'healthy' },
    { label: 'Database', value: health.database, status: health.database },
    { label: 'API Health', value: `${health.api.latency}ms`, status: health.api.status },
    { label: 'Email Service', value: 'TODO', status: 'todo' },
    { label: 'Payment Gateway', value: health.payment.label, status: health.payment.status },
    { label: 'Storage', value: health.storage.usage, status: health.storage.status },
  ]

  return (
    <>
      <div className={`sys-health-banner sys-health-banner--${health.overall}`}>
        <Activity size={20} />
        System is <strong>{health.overall}</strong>
        {health.overall === 'healthy' ? ' — all core services operational' : ' — check API connectivity'}
      </div>

      <div className="sys-dashboard">
        {cards.map((c) => {
          const Icon = STATUS_ICON[c.status] || Activity
          return (
            <article key={c.label} className={`sys-stat-card sys-stat-card--${c.status}`}>
              <Icon size={16} />
              <span>{c.label}</span>
              <strong>{c.value}</strong>
            </article>
          )
        })}
      </div>

      <div className="sys-panel" style={{ marginTop: 16 }}>
        <h2>Server Logs</h2>
        <p className="sys-todo-hint">Simulated client-side logs. TODO: Backend log streaming API.</p>
        <div className="sys-log-tabs">
          {['error', 'access', 'api', 'cron'].map((type) => (
            <div key={type} className="sys-log-section">
              <h3>{type} logs</h3>
              <ul className="sys-log-list">
                {serverLogs.filter((l) => l.type === type || type === 'api').slice(0, 8).map((log) => (
                  <li key={log.id}><code>{log.message}</code><time>{new Date(log.timestamp).toLocaleTimeString()}</time></li>
                ))}
                {!serverLogs.filter((l) => l.type === type).length ? <li className="sys-muted">No {type} logs</li> : null}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function PerformanceCenter({ performance, perfPrefs, onPrefChange }) {
  const metrics = performance
    ? Object.entries(performance).map(([key, value]) => ({ label: key.replace(/([A-Z])/g, ' $1'), value }))
    : []

  const toggles = [
    { key: 'lazyLoading', label: 'Enable Lazy Loading' },
    { key: 'imageCompression', label: 'Enable Image Compression' },
    { key: 'caching', label: 'Enable Caching' },
    { key: 'codeSplitting', label: 'Enable Code Splitting' },
    { key: 'gzip', label: 'Enable GZIP' },
    { key: 'cdn', label: 'Enable CDN (TODO)' },
  ]

  return (
    <>
      <div className="sys-dashboard">
        {metrics.map((m) => (
          <article key={m.label} className="sys-stat-card">
            <span>{m.label}</span>
            <strong>{m.value}</strong>
          </article>
        ))}
      </div>

      <div className="sys-panel">
        <h2>Optimization Center</h2>
        <p className="sys-todo-hint">Preferences stored locally. Vite handles code splitting; CDN requires deployment config.</p>
        <div className="sys-opt-list">
          {toggles.map((t) => (
            <label key={t.key} className="sys-opt-row">
              <span>{t.label}</span>
              <input
                type="checkbox"
                checked={!!perfPrefs[t.key]}
                disabled={t.key === 'cdn'}
                onChange={(e) => onPrefChange({ [t.key]: e.target.checked })}
              />
            </label>
          ))}
        </div>
        <div className="sys-todo-hint" style={{ marginTop: 12 }}>Unused assets report — TODO: build analyzer integration</div>
      </div>
    </>
  )
}
