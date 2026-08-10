import { Monitor, Smartphone, Trash2 } from 'lucide-react'
import { formatAuditDate } from '../../../utils/systemAdminUtils'
import { SettingsPanel, SettingsToggle } from '../settings/SettingsForm'

export function SecurityDashboard({ security, loading }) {
  if (loading) return <div className="sys-dashboard">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="sys-stat-card sys-skeleton" />)}</div>

  const cards = [
    { label: 'Failed Logins', value: security.failedLogins },
    { label: 'Successful Logins', value: security.successfulLogins },
    { label: 'Blocked Users', value: security.blockedUsers },
    { label: '2FA Enabled', value: security.twoFaEnabled ? 'Yes' : 'No (TODO)' },
    { label: 'Password Strength', value: security.passwordStrength },
    { label: 'Active Sessions', value: security.activeSessions },
    { label: 'Suspicious Activity', value: security.suspiciousActivity },
  ]

  return (
    <div className="sys-dashboard">
      {cards.map((c) => (
        <article key={c.label} className="sys-stat-card">
          <span>{c.label}</span>
          <strong>{c.value}</strong>
        </article>
      ))}
    </div>
  )
}

export function ActiveSessionsPanel({ sessions, onRevoke, onRevokeAll }) {
  if (!sessions.length) {
    return <div className="sys-empty"><p>No active sessions recorded</p></div>
  }

  return (
    <div className="sys-session-list">
      {sessions.map((session) => (
        <article key={session.id} className={`sys-session ${session.current ? 'is-current' : ''}`}>
          <div className="sys-session__icon">{session.device === 'Mobile' ? <Smartphone size={18} /> : <Monitor size={18} />}</div>
          <div className="sys-session__body">
            <strong>{session.current ? 'Current device' : session.device}</strong>
            <p>{session.browser} · {session.os} · {session.location || 'Unknown location'}</p>
            <small>IP: {session.ip} · Login {formatAuditDate(session.loginTime)}</small>
          </div>
          {!session.current ? (
            <button type="button" className="sys-btn sys-btn--ghost sys-btn--sm" onClick={() => onRevoke(session.id)}>
              <Trash2 size={14} /> Logout device
            </button>
          ) : null}
        </article>
      ))}
      <button type="button" className="sys-btn sys-btn--ghost" onClick={onRevokeAll}>Logout all devices</button>
      <p className="sys-todo-hint">Session tracking is client-side until backend session API exists.</p>
    </div>
  )
}

export function SecuritySettingsPanel({ security }) {
  return (
    <SettingsPanel title="Security Settings" description="Policy configuration (local preferences until backend enforcement).">
      <p className="sys-todo-hint">TODO: Backend password policy, IP whitelist, and 2FA enforcement APIs.</p>
      <SettingsToggle label="Password expiry (90 days)" checked={false} onChange={() => {}} disabled />
      <SettingsToggle label="Session timeout" checked title={`${security?.sessionTimeout || 60} minutes`} onChange={() => {}} disabled />
      <SettingsToggle label="Device login alerts" checked onChange={() => {}} />
      <SettingsToggle label="IP whitelist" checked={false} onChange={() => {}} disabled title="TODO" />
      <SettingsToggle label="Trusted devices" checked onChange={() => {}} disabled title="TODO" />
      <div className="sys-stat-card" style={{ marginTop: 12 }}>
        <span>JWT Status</span>
        <strong>{security?.jwtStatus || '—'}</strong>
      </div>
    </SettingsPanel>
  )
}

export function FailedLoginsPanel({ failures }) {
  if (!failures.length) return <div className="sys-empty"><p>No failed login attempts</p></div>
  return (
    <ul className="sys-timeline">
      {failures.slice(0, 20).map((f) => (
        <li key={f.id}>
          <strong>{f.email}</strong> · {f.browser} · {f.device}
          <time>{formatAuditDate(f.timestamp)}</time>
        </li>
      ))}
    </ul>
  )
}
