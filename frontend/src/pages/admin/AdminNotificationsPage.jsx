import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { useNotificationCenter } from '../../hooks/useNotificationCenter'
import { NotificationSettingsPanel } from '../../components/admin/settings/SecuritySettings'
import {
  NotificationDashboard,
  NotificationFeed,
  NotificationTable,
  NotificationDrawer,
} from '../../components/admin/notifications/NotificationFeed'
import {
  NotificationSearchBar,
  NotificationTabs,
  MainSectionTabs,
  NotificationFilters,
  BulkActionsBar,
  PaginationBar,
} from '../../components/admin/notifications/NotificationFilters'
import {
  EmailCenter,
  SmsCenter,
  WhatsAppCenter,
  PushCenter,
  AnnouncementManager,
  AutomationRulesPanel,
  ActivityTimeline,
  AnalyticsSummary,
} from '../../components/admin/notifications/CommunicationSections'

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return <div className={`ntf-toast ntf-toast--${type === 'err' ? 'err' : 'success'}`} role="status">{message}</div>
}

export function AdminNotificationsPage() {
  const ntf = useNotificationCenter()
  const [section, setSection] = useState('center')
  const [drawerItem, setDrawerItem] = useState(null)
  const [viewMode, setViewMode] = useState('feed')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  const handleOpen = (item) => {
    setDrawerItem(item)
    if (item.unread) ntf.readNotification(item.id)
  }

  const handleMarkRead = (id) => {
    ntf.readNotification(id)
    setDrawerItem((item) => (item?.id === id ? { ...item, unread: false } : item))
  }

  useEffect(() => {
    const interval = setInterval(ntf.refresh, 60000)
    return () => clearInterval(interval)
  }, [ntf.refresh])

  return (
    <div className="ntf-page">
      <header className="ntf-page-header">
        <div>
          <nav className="ntf-breadcrumb">
            <Link to="/admin">Admin</Link> / <span>Notifications &amp; Communication</span>
          </nav>
          <h1>Enterprise Notifications &amp; Communication Center</h1>
          <p>
            Synthesized from orders, customers, inventory &amp; dashboard APIs — email/SMS/push stored locally until send APIs exist.
          </p>
        </div>
        <NotificationSearchBar value={ntf.search} onChange={ntf.setSearch} />
      </header>

      {ntf.error ? (
        <div className="ntf-message ntf-message--err">
          {ntf.error}
          <button type="button" className="ntf-btn ntf-btn--ghost ntf-btn--sm" style={{ marginLeft: 8 }} onClick={ntf.refresh}>
            Retry
          </button>
        </div>
      ) : null}

      <MainSectionTabs active={section} onChange={setSection} />

      {section === 'center' ? (
        <>
          <NotificationDashboard stats={ntf.dashboard} loading={ntf.loading} />
          <AnalyticsSummary dashboard={ntf.dashboard} />

          <NotificationTabs active={ntf.tab} onChange={(t) => { ntf.setTab(t); ntf.setPage(1) }} />

          <NotificationFilters
            filters={ntf.filters}
            onChange={(f) => { ntf.setFilters(f); ntf.setPage(1) }}
            onRefresh={ntf.refresh}
            refreshing={ntf.refreshing}
          />

          <div className="ntf-panel">
            <div className="ntf-toolbar">
              <h2 style={{ margin: 0 }}>
                Notification Feed
                {ntf.unreadCount ? <span className="ntf-bell__badge" style={{ position: 'static', display: 'inline-flex', marginLeft: 8 }}>{ntf.unreadCount}</span> : null}
              </h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className={`ntf-btn ntf-btn--ghost ntf-btn--sm ${viewMode === 'feed' ? 'is-active' : ''}`} onClick={() => setViewMode('feed')}>Feed</button>
                <button type="button" className={`ntf-btn ntf-btn--ghost ntf-btn--sm ${viewMode === 'table' ? 'is-active' : ''}`} onClick={() => setViewMode('table')}>Table</button>
                <button type="button" className="ntf-btn ntf-btn--primary ntf-btn--sm" onClick={ntf.readAll}>Mark all read</button>
                <button type="button" className="ntf-btn ntf-btn--ghost ntf-btn--sm" onClick={ntf.exportCsv}>Export CSV</button>
                <button type="button" className="ntf-btn ntf-btn--ghost ntf-btn--sm" onClick={() => window.print()}>Print</button>
              </div>
            </div>

            <BulkActionsBar
              selectedCount={ntf.selected.length}
              onMarkRead={ntf.bulkMarkRead}
              onExport={ntf.exportCsv}
              onClear={() => ntf.setSelected([])}
            />

            {ntf.loading ? (
              <div className="ntf-feed">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="ntf-skeleton" />)}
              </div>
            ) : viewMode === 'table' ? (
              <NotificationTable
                items={ntf.paginated}
                onOpen={handleOpen}
                selected={ntf.selected}
                onToggleSelect={ntf.toggleSelect}
              />
            ) : (
              <NotificationFeed
                items={ntf.paginated}
                onOpen={handleOpen}
                selected={ntf.selected}
                onToggleSelect={ntf.toggleSelect}
                onPin={ntf.pinNotification}
              />
            )}

            <PaginationBar
              page={ntf.page}
              pageSize={ntf.pageSize}
              total={ntf.total}
              onPageChange={ntf.setPage}
              onPageSizeChange={(size) => { ntf.setPageSize(size); ntf.setPage(1) }}
            />
          </div>
        </>
      ) : null}

      {section === 'email' ? (
        <EmailCenter
          drafts={ntf.emailDrafts}
          sent={ntf.sent}
          onSend={ntf.sendEmail}
          onSaveDraft={ntf.saveDraft}
          onToast={showToast}
        />
      ) : null}

      {section === 'sms' ? <SmsCenter sent={ntf.sent} onSend={ntf.queueSms} onToast={showToast} /> : null}
      {section === 'whatsapp' ? <WhatsAppCenter onToast={showToast} /> : null}
      {section === 'push' ? <PushCenter sent={ntf.sent} onSchedule={ntf.schedulePush} onToast={showToast} /> : null}
      {section === 'announcements' ? (
        <AnnouncementManager announcements={ntf.announcements} onCreate={ntf.createAnnouncement} onToast={showToast} />
      ) : null}
      {section === 'automation' ? (
        <AutomationRulesPanel rules={ntf.automation} onUpdate={ntf.updateAutomation} />
      ) : null}
      {section === 'history' ? (
        <div className="ntf-panel">
          <h2>Message History &amp; Activity Log</h2>
          <ActivityTimeline activity={ntf.activity} sent={ntf.sent} />
        </div>
      ) : null}
      {section === 'preferences' ? (
        <div className="ntf-panel">
          <NotificationSettingsPanel
            data={ntf.notificationPrefs}
            onChange={ntf.updateNotificationPrefs}
          />
        </div>
      ) : null}

      <NotificationDrawer
        item={drawerItem}
        onClose={() => setDrawerItem(null)}
        onMarkRead={handleMarkRead}
        onPin={ntf.pinNotification}
      />

      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </div>
  )
}
