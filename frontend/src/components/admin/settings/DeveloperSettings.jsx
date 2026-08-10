import { SettingsField, SettingsGrid, SettingsPanel, SettingsToggle } from './SettingsForm'

export function MediaSettings({ data, onChange }) {
  return (
    <SettingsPanel
      title="Media & Storage"
      description="Upload limits and image optimization."
      todo="Backend: MAX_IMAGE_MB env + /api/uploads/photo. AWS S3 via backend env if configured."
    >
      <SettingsGrid>
        <SettingsField label="Max Upload Size (MB)">
          <input type="number" min={1} max={100} value={data.maxUploadMb} onChange={(e) => onChange({ maxUploadMb: Number(e.target.value) })} />
        </SettingsField>
        <SettingsField label="Image Quality (%)">
          <input type="number" min={50} max={100} value={data.imageQuality} onChange={(e) => onChange({ imageQuality: Number(e.target.value) })} />
        </SettingsField>
        <SettingsField label="Storage Location">
          <select value={data.storageLocation} onChange={(e) => onChange({ storageLocation: e.target.value })}>
            <option value="local">Local</option>
            <option value="s3">AWS S3</option>
          </select>
        </SettingsField>
      </SettingsGrid>
      <SettingsField label="Allowed Formats">
        <input
          value={(data.allowedFormats || []).join(', ')}
          onChange={(e) => onChange({ allowedFormats: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          placeholder="png, jpg, jpeg, webp"
        />
      </SettingsField>
      <SettingsToggle label="Enable Compression" checked={data.compression} onChange={(v) => onChange({ compression: v })} />
    </SettingsPanel>
  )
}

export function SeoSettings({ data, onChange }) {
  return (
    <SettingsPanel title="SEO & Analytics" description="Search engine and tracking configuration.">
      <SettingsField label="Meta Title"><input value={data.metaTitle} onChange={(e) => onChange({ metaTitle: e.target.value })} /></SettingsField>
      <SettingsField label="Meta Description"><textarea rows={3} value={data.metaDescription} onChange={(e) => onChange({ metaDescription: e.target.value })} /></SettingsField>
      <SettingsGrid>
        <SettingsField label="Google Analytics ID"><input value={data.googleAnalytics} onChange={(e) => onChange({ googleAnalytics: e.target.value })} placeholder="G-XXXXXXXX" /></SettingsField>
        <SettingsField label="Meta Pixel ID"><input value={data.metaPixel} onChange={(e) => onChange({ metaPixel: e.target.value })} /></SettingsField>
        <SettingsField label="Google Tag Manager"><input value={data.googleTagManager} onChange={(e) => onChange({ googleTagManager: e.target.value })} placeholder="GTM-XXXX" /></SettingsField>
      </SettingsGrid>
      <SettingsField label="robots.txt"><textarea rows={5} value={data.robotsTxt} onChange={(e) => onChange({ robotsTxt: e.target.value })} /></SettingsField>
      <SettingsToggle label="Sitemap Enabled" checked={data.sitemapEnabled} onChange={(v) => onChange({ sitemapEnabled: v })} disabled title="TODO: sitemap generator API" />
    </SettingsPanel>
  )
}

export function IntegrationsSettings({ data, onChange }) {
  return (
    <SettingsPanel title="Integrations" description="Third-party services connected to your store.">
      <SettingsToggle label="WhatsApp Widget" checked={data.whatsapp} onChange={(v) => onChange({ whatsapp: v })} />
      <SettingsToggle label="Razorpay" checked={data.razorpay} onChange={(v) => onChange({ razorpay: v })} disabled />
      <SettingsToggle label="Shiprocket" checked={data.shiprocket} onChange={(v) => onChange({ shiprocket: v })} disabled />
      <SettingsToggle label="AWS S3 Storage" checked={data.awsS3} onChange={(v) => onChange({ awsS3: v })} disabled title="Configure via backend AWS_* env" />
    </SettingsPanel>
  )
}

export function ApiSettings() {
  return (
    <SettingsPanel title="API Keys" description="Manage programmatic access." todo="TODO: Backend API key generation & webhook management">
      <div className="set-empty">
        <p>No API keys available. Backend endpoint required to generate and revoke keys.</p>
        <button type="button" className="set-btn set-btn--primary" disabled>Generate API Key (TODO)</button>
      </div>
    </SettingsPanel>
  )
}

export function BackupSettings() {
  return (
    <SettingsPanel title="Backups" description="Database and media backup management." todo="TODO: Backend backup/restore API">
      <div className="set-action-grid">
        <button type="button" className="set-btn set-btn--ghost" disabled>Manual Backup (TODO)</button>
        <button type="button" className="set-btn set-btn--ghost" disabled>Schedule Backup (TODO)</button>
        <button type="button" className="set-btn set-btn--ghost" disabled>Restore Backup (TODO)</button>
        <button type="button" className="set-btn set-btn--ghost" disabled>Download Backup (TODO)</button>
      </div>
    </SettingsPanel>
  )
}
