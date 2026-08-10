import { SettingsField, SettingsGrid, SettingsPanel } from './SettingsForm'

export function GeneralSettings({ data, onChange }) {
  return (
    <SettingsPanel title="General Settings" description="Basic store information and branding.">
      <SettingsGrid>
        <SettingsField label="Company Name" required>
          <input value={data.companyName} onChange={(e) => onChange({ companyName: e.target.value })} />
        </SettingsField>
        <SettingsField label="Website Name">
          <input value={data.websiteName} onChange={(e) => onChange({ websiteName: e.target.value })} />
        </SettingsField>
        <SettingsField label="Website URL">
          <input type="url" value={data.websiteUrl} onChange={(e) => onChange({ websiteUrl: e.target.value })} />
        </SettingsField>
        <SettingsField label="Admin Email">
          <input type="email" value={data.adminEmail} onChange={(e) => onChange({ adminEmail: e.target.value })} />
        </SettingsField>
        <SettingsField label="Support Email">
          <input type="email" value={data.supportEmail} onChange={(e) => onChange({ supportEmail: e.target.value })} />
        </SettingsField>
        <SettingsField label="Phone">
          <input value={data.phone} onChange={(e) => onChange({ phone: e.target.value })} />
        </SettingsField>
        <SettingsField label="Timezone">
          <select value={data.timezone} onChange={(e) => onChange({ timezone: e.target.value })}>
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </SettingsField>
        <SettingsField label="Date Format">
          <select value={data.dateFormat} onChange={(e) => onChange({ dateFormat: e.target.value })}>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </SettingsField>
        <SettingsField label="Time Format">
          <select value={data.timeFormat} onChange={(e) => onChange({ timeFormat: e.target.value })}>
            <option value="12h">12-hour</option>
            <option value="24h">24-hour</option>
          </select>
        </SettingsField>
      </SettingsGrid>
      <SettingsField label="Business Address">
        <textarea rows={3} value={data.address} onChange={(e) => onChange({ address: e.target.value })} />
      </SettingsField>
      <SettingsGrid>
        <SettingsField label="Logo URL" hint="TODO: media library picker">
          <input value={data.logo} onChange={(e) => onChange({ logo: e.target.value })} placeholder="https://..." />
        </SettingsField>
        <SettingsField label="Favicon URL">
          <input value={data.favicon} onChange={(e) => onChange({ favicon: e.target.value })} placeholder="https://..." />
        </SettingsField>
      </SettingsGrid>
    </SettingsPanel>
  )
}

export function CompanySettings({ data, onChange }) {
  const social = data.socialLinks || {}
  const setSocial = (key, value) => onChange({ socialLinks: { ...social, [key]: value } })

  return (
    <SettingsPanel title="Company Profile" description="Legal, invoice, and brand assets.">
      <SettingsGrid>
        <SettingsField label="Company Logo URL"><input value={data.logo} onChange={(e) => onChange({ logo: e.target.value })} /></SettingsField>
        <SettingsField label="Dark Logo URL"><input value={data.darkLogo} onChange={(e) => onChange({ darkLogo: e.target.value })} /></SettingsField>
        <SettingsField label="Light Logo URL"><input value={data.lightLogo} onChange={(e) => onChange({ lightLogo: e.target.value })} /></SettingsField>
        <SettingsField label="Invoice Logo URL"><input value={data.invoiceLogo} onChange={(e) => onChange({ invoiceLogo: e.target.value })} /></SettingsField>
        <SettingsField label="GST Number"><input value={data.gstNumber} onChange={(e) => onChange({ gstNumber: e.target.value })} /></SettingsField>
        <SettingsField label="Tax ID"><input value={data.taxId} onChange={(e) => onChange({ taxId: e.target.value })} /></SettingsField>
        <SettingsField label="Support Number"><input value={data.supportNumber} onChange={(e) => onChange({ supportNumber: e.target.value })} /></SettingsField>
      </SettingsGrid>
      <SettingsField label="Business Address"><textarea rows={3} value={data.businessAddress} onChange={(e) => onChange({ businessAddress: e.target.value })} /></SettingsField>
      <h3 className="set-subtitle">Social Links</h3>
      <SettingsGrid cols={3}>
        {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map((key) => (
          <SettingsField key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
            <input value={social[key] || ''} onChange={(e) => setSocial(key, e.target.value)} placeholder="https://..." />
          </SettingsField>
        ))}
      </SettingsGrid>
    </SettingsPanel>
  )
}
