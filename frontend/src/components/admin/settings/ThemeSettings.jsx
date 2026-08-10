import { Monitor, Moon, Sun } from 'lucide-react'
import { useAdminTheme } from '../../../hooks/useAdminTheme'
import { SettingsField, SettingsGrid, SettingsPanel, SettingsToggle } from './SettingsForm'

export function ThemeSettings({ appearance, onAppearanceChange }) {
  const { theme, setTheme } = useAdminTheme()
  const storedMode = (() => {
    try {
      return localStorage.getItem('omgs_admin_theme') || 'light'
    } catch {
      return 'light'
    }
  })()

  return (
    <>
      <SettingsPanel title="Appearance" description="Admin panel look and feel.">
        <h3 className="set-subtitle">Color Mode</h3>
        <div className="set-theme-modes">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`set-theme-mode ${(storedMode === id || (id !== 'system' && theme === id)) ? 'is-active' : ''}`}
              onClick={() => setTheme(id)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
        <SettingsGrid cols={3}>
          <SettingsField label="Primary Color">
            <input type="color" value={appearance.primaryColor || '#6366f1'} onChange={(e) => onAppearanceChange({ primaryColor: e.target.value })} />
          </SettingsField>
          <SettingsField label="Accent Color">
            <input type="color" value={appearance.accentColor || '#8b5cf6'} onChange={(e) => onAppearanceChange({ accentColor: e.target.value })} />
          </SettingsField>
          <SettingsField label="Typography">
            <select value={appearance.typography || 'Inter'} onChange={(e) => onAppearanceChange({ typography: e.target.value })}>
              <option value="Inter">Inter</option>
              <option value="System">System UI</option>
              <option value="Georgia">Georgia</option>
            </select>
          </SettingsField>
          <SettingsField label="Sidebar Style">
            <select value={appearance.sidebarStyle || 'default'} onChange={(e) => onAppearanceChange({ sidebarStyle: e.target.value })}>
              <option value="default">Default</option>
              <option value="compact">Compact</option>
              <option value="floating">Floating</option>
            </select>
          </SettingsField>
          <SettingsField label="Layout Width">
            <select value={appearance.layoutWidth || 'fluid'} onChange={(e) => onAppearanceChange({ layoutWidth: e.target.value })}>
              <option value="fluid">Fluid</option>
              <option value="boxed">Boxed</option>
            </select>
          </SettingsField>
        </SettingsGrid>
        <SettingsToggle label="Rounded Corners" checked={appearance.roundedCorners !== false} onChange={(v) => onAppearanceChange({ roundedCorners: v })} />
      </SettingsPanel>
    </>
  )
}

export function ProfileSettings({ form, setForm, onSave, saving, message, error }) {
  return (
    <SettingsPanel
      title="My Profile"
      description="Update your admin account using existing /api/account/profile."
      actions={
        <button type="button" className="set-btn set-btn--primary" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      }
    >
      {message ? <p className="set-message set-message--ok">{message}</p> : null}
      {error ? <p className="set-message set-message--err">{error}</p> : null}
      <SettingsGrid>
        <SettingsField label="Name" required><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></SettingsField>
        <SettingsField label="Email"><input value={form.email} disabled title="Email cannot be changed" /></SettingsField>
        <SettingsField label="Phone"><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></SettingsField>
      </SettingsGrid>
      <SettingsField label="Password" hint="Use forgot password flow to reset. TODO: change password API in profile">
        <input type="password" disabled placeholder="••••••••" />
      </SettingsField>
      <SettingsToggle label="Two-Factor Authentication" description="TODO: 2FA setup API" checked={false} onChange={() => {}} disabled />
      <h3 className="set-subtitle">Notification Preferences</h3>
      <SettingsToggle label="Email notifications" checked onChange={() => {}} />
      <SettingsToggle label="Order alerts" checked onChange={() => {}} />
    </SettingsPanel>
  )
}
