import { Truck } from 'lucide-react'
import { SettingsAlert, SettingsField, SettingsGrid, SettingsPanel, SettingsReadOnlyBadge, SettingsToggle } from './SettingsForm'

export function PaymentSettings({ data, onChange }) {
  return (
    <SettingsPanel
      title="Payment Gateways"
      description="Display-only view of configured payment methods. Razorpay logic is unchanged."
      todo="Payment credentials are configured via backend environment variables (RAZORPAY_KEY_ID, etc.)."
    >
      <SettingsAlert type="info">
        Active checkout uses existing <code>/api/payments/razorpay</code> endpoints. Toggles below are display preferences only.
      </SettingsAlert>
      <div className="set-gateway-grid">
        <SettingsToggle label="Razorpay" description="Primary online payments" checked={data.razorpay} onChange={(v) => onChange({ razorpay: v })} />
        <SettingsToggle label="Cash on Delivery" checked={data.cod} onChange={(v) => onChange({ cod: v })} disabled title="TODO: COD checkout flag API" />
        <SettingsToggle label="UPI" checked={data.upi} onChange={(v) => onChange({ upi: v })} disabled />
        <SettingsToggle label="Stripe" checked={data.stripe} onChange={(v) => onChange({ stripe: v })} disabled title="TODO: Stripe integration" />
        <SettingsToggle label="PayPal" checked={data.paypal} onChange={(v) => onChange({ paypal: v })} disabled title="TODO" />
        <SettingsToggle label="Bank Transfer" checked={data.bankTransfer} onChange={(v) => onChange({ bankTransfer: v })} disabled />
      </div>
      <div className="set-readonly-grid">
        <SettingsReadOnlyBadge label="Razorpay Key ID" value="Configured in backend .env" configured />
        <SettingsReadOnlyBadge label="Webhook Secret" value="Configured in backend .env" configured />
      </div>
    </SettingsPanel>
  )
}

export function ShippingSettings({ data, onChange }) {
  return (
    <SettingsPanel
      title="Shipping"
      description="Carrier and delivery settings. Shiprocket integration is unchanged."
      todo="Shiprocket credentials: SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD in backend .env"
    >
      <SettingsAlert type="info">
        <Truck size={16} /> Existing shipping service uses Shiprocket API via backend env configuration.
      </SettingsAlert>
      <SettingsGrid>
        <SettingsField label="Default Carrier">
          <select value={data.defaultCarrier} onChange={(e) => onChange({ defaultCarrier: e.target.value })}>
            <option value="Shiprocket">Shiprocket</option>
            <option value="Manual">Manual</option>
          </select>
        </SettingsField>
        <SettingsField label="Flat Shipping Rate (₹)">
          <input type="number" min={0} value={data.flatRate} onChange={(e) => onChange({ flatRate: Number(e.target.value) })} />
        </SettingsField>
        <SettingsField label="Free Shipping Threshold (₹)">
          <input type="number" min={0} value={data.freeShippingThreshold} onChange={(e) => onChange({ freeShippingThreshold: Number(e.target.value) })} />
        </SettingsField>
        <SettingsField label="Delivery Estimate (days)">
          <input type="number" min={1} value={data.deliveryEstimateDays} onChange={(e) => onChange({ deliveryEstimateDays: Number(e.target.value) })} />
        </SettingsField>
      </SettingsGrid>
      <SettingsToggle label="Tracking Enabled" checked={data.trackingEnabled} onChange={(v) => onChange({ trackingEnabled: v })} />
    </SettingsPanel>
  )
}

export function TaxSettings({ data, onChange }) {
  return (
    <SettingsPanel title="Taxes" description="Tax display and GST settings." todo="TODO: Tax calculation API">
      <SettingsToggle label="Enable Taxes" checked={data.enabled} onChange={(v) => onChange({ enabled: v })} />
      <SettingsToggle label="Prices Include Tax" checked={data.inclusive} onChange={(v) => onChange({ inclusive: v })} />
      <SettingsToggle label="GST Enabled" checked={data.gstEnabled} onChange={(v) => onChange({ gstEnabled: v })} />
      <SettingsField label="Default Tax Rate (%)">
        <input type="number" min={0} max={100} step={0.1} value={data.defaultRate} onChange={(e) => onChange({ defaultRate: Number(e.target.value) })} />
      </SettingsField>
    </SettingsPanel>
  )
}

export function LocalizationSettings({ data, onChange }) {
  return (
    <SettingsPanel title="Localization" description="Regional formats for dates, numbers, and currency.">
      <SettingsGrid cols={3}>
        <SettingsField label="Timezone">
          <select value={data.timezone} onChange={(e) => onChange({ timezone: e.target.value })}>
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="UTC">UTC</option>
          </select>
        </SettingsField>
        <SettingsField label="Country">
          <select value={data.country} onChange={(e) => onChange({ country: e.target.value })}>
            <option value="IN">India</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
          </select>
        </SettingsField>
        <SettingsField label="Language">
          <select value={data.language} onChange={(e) => onChange({ language: e.target.value })}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </SettingsField>
        <SettingsField label="Currency">
          <select value={data.currency} onChange={(e) => onChange({ currency: e.target.value })}>
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </SettingsField>
        <SettingsField label="Date Format">
          <select value={data.dateFormat} onChange={(e) => onChange({ dateFormat: e.target.value })}>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
        </SettingsField>
        <SettingsField label="Number Format">
          <select value={data.numberFormat} onChange={(e) => onChange({ numberFormat: e.target.value })}>
            <option value="en-IN">en-IN</option>
            <option value="en-US">en-US</option>
          </select>
        </SettingsField>
      </SettingsGrid>
    </SettingsPanel>
  )
}
