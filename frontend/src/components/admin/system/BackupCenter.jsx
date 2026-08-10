import { Database, Download, HardDrive, RefreshCw, RotateCcw, Trash2 } from 'lucide-react'
import { formatAuditDate } from '../../../utils/systemAdminUtils'

export function BackupDashboard({ backups, onBackup, onDownload, onRestore, onDelete, loading }) {
  const types = [
    { id: 'full', label: 'Full Backup', icon: Database },
    { id: 'incremental', label: 'Incremental', icon: RefreshCw },
    { id: 'database', label: 'Database', icon: HardDrive },
    { id: 'settings', label: 'Settings', icon: HardDrive },
    { id: 'media', label: 'Media', icon: HardDrive },
  ]

  return (
    <div className="sys-panel">
      <h2>Backup Center</h2>
      <p className="sys-todo-hint">
        Local backup exports admin settings &amp; logs from localStorage. TODO: Backend database/media backup API.
      </p>

      <div className="sys-backup-actions">
        {types.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" className="sys-backup-btn" onClick={() => onBackup(id)} disabled={loading}>
            <Icon size={20} />
            <strong>{label}</strong>
            <span>Manual</span>
          </button>
        ))}
      </div>

      <button type="button" className="sys-btn sys-btn--ghost" disabled title="TODO: cron scheduler API">
        Schedule Backup (TODO)
      </button>

      <h3 style={{ marginTop: 24 }}>Backup History</h3>
      {!backups.length ? (
        <div className="sys-empty"><p>No backups yet</p></div>
      ) : (
        <>
          <div className="sys-table-wrap">
            <table className="sys-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.id}>
                    <td>{formatAuditDate(b.date)}</td>
                    <td>{b.type}</td>
                    <td>{b.size}</td>
                    <td>{b.duration}</td>
                    <td><span className="sys-status sys-status--success">{b.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button type="button" className="sys-btn sys-btn--ghost sys-btn--sm" onClick={() => onDownload(b.id)}><Download size={14} /></button>
                        <button type="button" className="sys-btn sys-btn--ghost sys-btn--sm" onClick={() => onRestore(b.id)}><RotateCcw size={14} /></button>
                        <button type="button" className="sys-btn sys-btn--ghost sys-btn--sm" onClick={() => onDelete(b.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sys-cards--mobile">
            {backups.map((b) => (
              <article key={b.id} className="sys-card-row">
                <strong>{b.type} backup</strong>
                <p>{b.size} · {b.duration}</p>
                <small>{formatAuditDate(b.date)}</small>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button type="button" className="sys-btn sys-btn--ghost sys-btn--sm" onClick={() => onDownload(b.id)}>Download</button>
                  <button type="button" className="sys-btn sys-btn--ghost sys-btn--sm" onClick={() => onRestore(b.id)}>Restore</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
