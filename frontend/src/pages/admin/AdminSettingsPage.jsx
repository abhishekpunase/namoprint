import { Navigate, useParams } from 'react-router-dom'
import { useSettingsStore, useActivityLogs } from '../../hooks/useSettingsStore'
import { useThemeSettings } from '../../hooks/useThemeSettings'
import { SettingsSidebar } from '../../components/admin/settings/SettingsSidebar'
import { GeneralSettings, CompanySettings } from '../../components/admin/settings/GeneralSettings'
import { SecuritySettings, AuthenticationSettings, EmailSettings, NotificationSettingsPanel } from '../../components/admin/settings/SecuritySettings'
import { PaymentSettings, ShippingSettings, TaxSettings, LocalizationSettings } from '../../components/admin/settings/CommerceSettings'
import { MediaSettings, SeoSettings, IntegrationsSettings, ApiSettings, BackupSettings } from '../../components/admin/settings/DeveloperSettings'
import { LogsViewer } from '../../components/admin/settings/LogsViewer'
import { ThemeSettings } from '../../components/admin/settings/ThemeSettings'
import { getSectionMeta } from '../../utils/settingsAdminUtils'

function SettingsSaveBar({ dirty, saving, message, error, onSave, onDiscard }) {
  return (
    <div className={`set-save-bar ${dirty ? 'is-dirty' : ''}`}>
      <div>
        {dirty ? <span>Unsaved changes</span> : <span>All changes saved locally</span>}
        {message ? <em className="set-save-msg">{message}</em> : null}
        {error ? <em className="set-save-err">{error}</em> : null}
      </div>
      <div className="set-save-bar__actions">
        <button type="button" className="set-btn set-btn--ghost" onClick={onDiscard} disabled={!dirty || saving}>Discard</button>
        <button type="button" className="set-btn set-btn--primary" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

function SettingsContent({ section, store, themeSettings, logsHook }) {
  const { settings, updateSection } = store
  const { appearance, saveAppearance } = themeSettings

  switch (section) {
    case 'general':
      return <GeneralSettings data={settings.general} onChange={(p) => updateSection('general', p)} />
    case 'company':
      return <CompanySettings data={settings.company} onChange={(p) => updateSection('company', p)} />
    case 'security':
      return <SecuritySettings data={settings.security} onChange={(p) => updateSection('security', p)} />
    case 'authentication':
      return <AuthenticationSettings data={settings.authentication} onChange={(p) => updateSection('authentication', p)} />
    case 'email':
      return <EmailSettings data={settings.email} onChange={(p) => updateSection('email', p)} />
    case 'notifications':
      return <NotificationSettingsPanel data={settings.notifications} onChange={(p) => updateSection('notifications', p)} />
    case 'payments':
      return <PaymentSettings data={settings.payments} onChange={(p) => updateSection('payments', p)} />
    case 'shipping':
      return <ShippingSettings data={settings.shipping} onChange={(p) => updateSection('shipping', p)} />
    case 'taxes':
      return <TaxSettings data={settings.taxes} onChange={(p) => updateSection('taxes', p)} />
    case 'localization':
      return <LocalizationSettings data={settings.localization} onChange={(p) => updateSection('localization', p)} />
    case 'media':
      return <MediaSettings data={settings.media} onChange={(p) => updateSection('media', p)} />
    case 'seo':
      return <SeoSettings data={settings.seo} onChange={(p) => updateSection('seo', p)} />
    case 'integrations':
      return <IntegrationsSettings data={settings.integrations} onChange={(p) => updateSection('integrations', p)} />
    case 'api-keys':
      return <ApiSettings />
    case 'backups':
      return <BackupSettings />
    case 'logs':
      return <LogsViewer logs={logsHook.logs} onRefresh={logsHook.refresh} onClear={logsHook.clearLogs} />
    case 'appearance':
    case 'theme':
      return <ThemeSettings appearance={appearance} onAppearanceChange={saveAppearance} />
    default:
      return <Navigate to="/admin/settings/general" replace />
  }
}

export function AdminSettingsPage() {
  const { section = 'general' } = useParams()
  const store = useSettingsStore()
  const themeSettings = useThemeSettings()
  const logsHook = useActivityLogs()
  const meta = getSectionMeta(section)

  return (
    <div className="set-page">
      <header className="set-page-header">
        <div>
          <nav className="set-breadcrumb"><span>Admin</span> / <span>Settings</span> / <span>{meta?.label || section}</span></nav>
          <h1>Store Settings</h1>
          <p>Configure your store, security, integrations, and appearance.</p>
        </div>
      </header>

      <div className="set-layout">
        <SettingsSidebar activeSection={section} />
        <div className="set-content">
          <SettingsContent section={section} store={store} themeSettings={themeSettings} logsHook={logsHook} />
        </div>
      </div>

      <SettingsSaveBar
        dirty={store.dirty}
        saving={store.saving}
        message={store.message}
        error={store.error}
        onSave={store.saveSettings}
        onDiscard={store.discardChanges}
      />
    </div>
  )
}

export function AdminSettingsIndexPage() {
  return <Navigate to="/admin/settings/general" replace />
}
