import { SettingsAlert, SettingsField, SettingsGrid, SettingsPanel, SettingsToggle } from './SettingsForm'

export function SecuritySettings({ data, onChange }) {
  return (
    <SettingsPanel
      title="Security"
      description="Password policy, sessions, and access controls."
      todo="TODO: Backend security policy API — settings stored locally until connected."
    >
      <SettingsGrid>
        <SettingsField label="Minimum Password Length">
          <input type="number" min={6} max={32} value={data.minPasswordLength} onChange={(e) => onChange({ minPasswordLength: Number(e.target.value) })} />
        </SettingsField>
        <SettingsField label="Password Expiry (days)">
          <input type="number" min={0} value={data.passwordExpiryDays} onChange={(e) => onChange({ passwordExpiryDays: Number(e.target.value) })} />
        </SettingsField>
        <SettingsField label="Session Timeout (minutes)">
          <input type="number" min={5} value={data.sessionTimeoutMinutes} onChange={(e) => onChange({ sessionTimeoutMinutes: Number(e.target.value) })} />
        </SettingsField>
        <SettingsField label="Max Login Attempts">
          <input type="number" min={3} value={data.maxLoginAttempts} onChange={(e) => onChange({ maxLoginAttempts: Number(e.target.value) })} />
        </SettingsField>
      </SettingsGrid>
      <SettingsToggle label="Require 2FA" description="Two-factor authentication for admin accounts" checked={data.require2fa} onChange={(v) => onChange({ require2fa: v })} disabled title="TODO: 2FA backend" />
      <SettingsToggle label="Device Management" description="Track and revoke active sessions" checked={data.deviceManagement} onChange={(v) => onChange({ deviceManagement: v })} disabled title="TODO: device sessions API" />
      <SettingsField label="IP Whitelist" hint="One IP per line. TODO: enforce via backend">
        <textarea rows={4} value={data.ipWhitelist} onChange={(e) => onChange({ ipWhitelist: e.target.value })} placeholder="203.0.113.0" />
      </SettingsField>
    </SettingsPanel>
  )
}

export function AuthenticationSettings({ data, onChange }) {
  return (
    <SettingsPanel title="Authentication" description="Login methods and identity providers. Existing JWT auth is unchanged.">
      <SettingsAlert type="info">
        JWT access + refresh tokens are active via existing <code>/api/auth</code> routes. OAuth providers below are UI-only until backend integration.
      </SettingsAlert>
      <SettingsToggle label="JWT Authentication" description="Email/password with access + refresh tokens" checked={data.jwtEnabled} onChange={(v) => onChange({ jwtEnabled: v })} disabled />
      <SettingsToggle label="Remember Me" checked={data.rememberMe} onChange={(v) => onChange({ rememberMe: v })} />
      <SettingsToggle label="OAuth Providers" checked={data.oauthEnabled} onChange={(v) => onChange({ oauthEnabled: v })} disabled title="TODO" />
      <SettingsGrid>
        <SettingsToggle label="Google Login" checked={data.googleLogin} onChange={(v) => onChange({ googleLogin: v })} disabled />
        <SettingsToggle label="Facebook Login" checked={data.facebookLogin} onChange={(v) => onChange({ facebookLogin: v })} disabled />
        <SettingsToggle label="GitHub Login" checked={data.githubLogin} onChange={(v) => onChange({ githubLogin: v })} disabled />
        <SettingsToggle label="OTP Login" checked={data.otpLogin} onChange={(v) => onChange({ otpLogin: v })} disabled />
      </SettingsGrid>
    </SettingsPanel>
  )
}

export function EmailSettings({ data, onChange }) {
  return (
    <SettingsPanel
      title="Email (SMTP)"
      description="Transactional email configuration."
      todo="TODO: Backend exposes SMTP via environment variables only. Configure in backend .env — test email API not available."
    >
      <SettingsGrid>
        <SettingsField label="SMTP Host"><input value={data.smtpHost} onChange={(e) => onChange({ smtpHost: e.target.value })} placeholder="smtp.example.com" /></SettingsField>
        <SettingsField label="SMTP Port"><input type="number" value={data.smtpPort} onChange={(e) => onChange({ smtpPort: Number(e.target.value) })} /></SettingsField>
        <SettingsField label="Username"><input value={data.smtpUser} onChange={(e) => onChange({ smtpUser: e.target.value })} /></SettingsField>
        <SettingsField label="Password"><input type="password" value={data.smtpPass} onChange={(e) => onChange({ smtpPass: e.target.value })} /></SettingsField>
        <SettingsField label="Encryption">
          <select value={data.encryption} onChange={(e) => onChange({ encryption: e.target.value })}>
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
            <option value="none">None</option>
          </select>
        </SettingsField>
        <SettingsField label="Sender Email"><input type="email" value={data.senderEmail} onChange={(e) => onChange({ senderEmail: e.target.value })} /></SettingsField>
        <SettingsField label="Sender Name"><input value={data.senderName} onChange={(e) => onChange({ senderName: e.target.value })} /></SettingsField>
      </SettingsGrid>
      <button type="button" className="set-btn set-btn--ghost" disabled title="TODO: test email API">Send Test Email (TODO)</button>
    </SettingsPanel>
  )
}

export function NotificationSettingsPanel({ data, onChange }) {
  return (
    <SettingsPanel title="Notifications" description="Alert channels and event preferences.">
      <SettingsToggle label="Email Notifications" checked={data.emailNotifications} onChange={(v) => onChange({ emailNotifications: v })} />
      <SettingsToggle label="SMS Notifications" checked={data.smsNotifications} onChange={(v) => onChange({ smsNotifications: v })} disabled title="TODO: SMS provider" />
      <SettingsToggle label="Push Notifications" checked={data.pushNotifications} onChange={(v) => onChange({ pushNotifications: v })} disabled title="TODO" />
      <SettingsToggle label="Desktop Notifications" checked={data.desktopNotifications} onChange={(v) => onChange({ desktopNotifications: v })} />
      <h3 className="set-subtitle">Alerts</h3>
      <SettingsToggle label="Order Alerts" checked={data.orderAlerts} onChange={(v) => onChange({ orderAlerts: v })} />
      <SettingsToggle label="Inventory Alerts" checked={data.inventoryAlerts} onChange={(v) => onChange({ inventoryAlerts: v })} />
      <SettingsToggle label="Low Stock Alerts" checked={data.lowStockAlerts} onChange={(v) => onChange({ lowStockAlerts: v })} />
      <SettingsToggle label="Payment Alerts" checked={data.paymentAlerts} onChange={(v) => onChange({ paymentAlerts: v })} />
    </SettingsPanel>
  )
}
