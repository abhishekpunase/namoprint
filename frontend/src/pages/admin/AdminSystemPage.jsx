import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useSystemCenter } from '../../hooks/useSystemCenter'
import { AuditFilters, AuditKpiCards, AuditLogTable } from '../../components/admin/system/AuditLogCenter'
import { ActiveSessionsPanel, FailedLoginsPanel, SecurityDashboard, SecuritySettingsPanel } from '../../components/admin/system/SecurityCenter'
import { BackupDashboard } from '../../components/admin/system/BackupCenter'
import { PerformanceCenter, SystemMonitoringPanel } from '../../components/admin/system/SystemMonitoring'

const TABS = [
  { value: 'audit', label: 'Audit Logs' },
  { value: 'security', label: 'Security Center' },
  { value: 'backup', label: 'Backup & Recovery' },
  { value: 'monitoring', label: 'System Monitoring' },
  { value: 'performance', label: 'Performance' },
]

export function AdminSystemPage() {
  const sys = useSystemCenter()
  const [tab, setTab] = useState('audit')
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const toggleSelect = (id) => {
    sys.setSelected((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  }

  const handleBackup = (type) => {
    const entry = sys.runBackup(type)
    showToast(`${type} backup created (${entry.size})`)
  }

  const handleRestore = (id) => {
    if (!window.confirm('Restore this backup? Current local admin data will be overwritten.')) return
    if (sys.restore(id)) showToast('Backup restored locally')
    else showToast('Restore failed')
  }

  return (
    <div className="sys-page">
      <header className="sys-page-header">
        <div>
          <nav className="sys-breadcrumb"><Link to="/admin">Admin</Link> / <span>System Center</span></nav>
          <h1>Audit, Security, Backup &amp; System Operations</h1>
          <p>Enterprise operations center — audit synthesis from existing APIs + localStorage until dedicated backend services exist.</p>
        </div>
      </header>

      {sys.error ? (
        <div className="sys-message sys-message--err">
          {sys.error}
          <button type="button" className="sys-btn sys-btn--ghost sys-btn--sm" style={{ marginLeft: 8 }} onClick={sys.refresh}>Retry</button>
        </div>
      ) : null}
      {toast ? <p className="sys-message">{toast}</p> : null}

      <div className="sys-main-tabs">
        {TABS.map((t) => (
          <button key={t.value} type="button" className={`sys-main-tab ${tab === t.value ? 'is-active' : ''}`} onClick={() => setTab(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      <AuditKpiCards security={sys.security} health={sys.health} loading={sys.loading} />

      {tab === 'audit' ? (
        <>
          <AuditFilters
            filters={sys.filters}
            onChange={(f) => { sys.setFilters(f); sys.setPage(1) }}
            search={sys.search}
            onSearchChange={sys.setSearch}
            onRefresh={sys.refresh}
            refreshing={sys.refreshing}
            onExport={sys.exportCsv}
            onPrint={() => window.print()}
          />
          <div className="sys-panel">
            <h2>Audit Log Center</h2>
            <AuditLogTable
              logs={sys.paginated}
              selected={sys.selected}
              onToggleSelect={toggleSelect}
              loading={sys.loading}
            />
            <div className="sys-pagination">
              <span>{sys.total} events · Page {sys.page}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="sys-btn sys-btn--ghost sys-btn--sm" disabled={sys.page <= 1} onClick={() => sys.setPage(sys.page - 1)}>Previous</button>
                <button type="button" className="sys-btn sys-btn--ghost sys-btn--sm" disabled={sys.page * sys.pageSize >= sys.total} onClick={() => sys.setPage(sys.page + 1)}>Next</button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {tab === 'security' ? (
        <>
          <SecurityDashboard security={sys.security} loading={sys.loading} />
          <div className="sys-grid-2">
            <div className="sys-panel">
              <h2>Active Sessions</h2>
              <ActiveSessionsPanel sessions={sys.sessions} onRevoke={sys.logoutSession} onRevokeAll={sys.logoutAll} />
            </div>
            <div className="sys-panel">
              <h2>Failed Logins</h2>
              <FailedLoginsPanel failures={sys.failedLogins} />
            </div>
          </div>
          <SecuritySettingsPanel security={sys.security} />
        </>
      ) : null}

      {tab === 'backup' ? (
        <BackupDashboard
          backups={sys.backups}
          onBackup={handleBackup}
          onDownload={sys.downloadBackup}
          onRestore={handleRestore}
          onDelete={sys.removeBackup}
          loading={sys.loading}
        />
      ) : null}

      {tab === 'monitoring' ? (
        <SystemMonitoringPanel health={sys.health} serverLogs={sys.serverLogs} loading={sys.loading} />
      ) : null}

      {tab === 'performance' ? (
        <PerformanceCenter performance={sys.performance} perfPrefs={sys.perfPrefs} onPrefChange={sys.updatePerfPrefs} />
      ) : null}
    </div>
  )
}
