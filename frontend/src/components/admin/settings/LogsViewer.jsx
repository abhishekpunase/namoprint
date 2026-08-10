import { RefreshCw, Trash2 } from 'lucide-react'
import { formatUserDate } from '../../../utils/userAdminUtils'
import { SettingsPanel } from './SettingsForm'

const TYPE_LABELS = {
  user: 'User',
  settings: 'Settings',
  permission: 'Permission',
  profile: 'Profile',
  order: 'Order',
  product: 'Product',
}

export function LogsViewer({ logs, onRefresh, onClear }) {
  return (
    <SettingsPanel
      title="Activity Logs"
      description="Audit trail of admin actions (stored locally until backend logs API exists)."
      actions={
        <>
          <button type="button" className="set-btn set-btn--ghost" onClick={onRefresh}><RefreshCw size={16} /> Refresh</button>
          <button type="button" className="set-btn set-btn--ghost" onClick={onClear}><Trash2 size={16} /> Clear</button>
        </>
      }
    >
      {logs.length === 0 ? (
        <div className="set-empty"><p>No activity logs yet. Actions in settings and user management will appear here.</p></div>
      ) : (
        <div className="set-logs">
          {logs.map((log) => (
            <article key={log.id} className="set-log-item">
              <div className="set-log-item__head">
                <span className={`set-log-badge set-log-badge--${log.type || 'settings'}`}>{TYPE_LABELS[log.type] || log.type}</span>
                <time>{formatUserDate(log.timestamp)}</time>
              </div>
              <strong>{log.action}</strong>
              <p>{log.detail}</p>
              {log.user ? <small>By {log.user}</small> : null}
            </article>
          ))}
        </div>
      )}
    </SettingsPanel>
  )
}
