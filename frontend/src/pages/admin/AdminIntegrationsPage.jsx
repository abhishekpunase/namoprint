import { useEffect, useState } from 'react'
import { FiSave, FiSend } from 'react-icons/fi'
import { api } from '../../services/api'
import { AdminToggle } from '../../components/admin/ui/AdminToggle'

const SECRET_PLACEHOLDER = '••••••••'

const emptyForm = {
  razorpay: {
    enabled: true,
    keyId: '',
    keySecret: '',
    webhookSecret: '',
  },
  shiprocket: {
    enabled: true,
    email: '',
    password: '',
    baseUrl: 'https://apiv2.shiprocket.in/v1/external',
  },
  mail: {
    enabled: false,
    host: '',
    port: '587',
    secure: false,
    user: '',
    pass: '',
    from: '',
    contactToEmail: '',
  },
  contact: {
    displayEmail: '',
    displayPhone: '',
    whatsappNumber: '',
    address: '',
  },
}

function StatusBadge({ configured, label }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        configured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {configured ? `${label} ready` : `${label} not configured`}
    </span>
  )
}

export function AdminIntegrationsPage() {
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState(null)
  const [testEmail, setTestEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testingShiprocket, setTestingShiprocket] = useState(false)

  const load = () =>
    api
      .adminIntegrations()
      .then((payload) => {
        const data = payload.integrations
        setStatus(data)
        setForm({
          razorpay: {
            enabled: data.razorpay.enabled !== false,
            keyId: data.razorpay.keyId || '',
            keySecret: data.razorpay.keySecretSet ? SECRET_PLACEHOLDER : '',
            webhookSecret: data.razorpay.webhookSecretSet ? SECRET_PLACEHOLDER : '',
          },
          shiprocket: {
            enabled: data.shiprocket.enabled !== false,
            email: data.shiprocket.email || '',
            password: data.shiprocket.passwordSet ? SECRET_PLACEHOLDER : '',
            baseUrl: data.shiprocket.baseUrl || 'https://apiv2.shiprocket.in/v1/external',
          },
          mail: {
            enabled: data.mail.enabled !== false,
            host: data.mail.host || '',
            port: String(data.mail.port || 587),
            secure: Boolean(data.mail.secure),
            user: data.mail.user || '',
            pass: data.mail.passSet ? SECRET_PLACEHOLDER : '',
            from: data.mail.from || '',
            contactToEmail: data.mail.contactToEmail || '',
          },
          contact: {
            displayEmail: data.contact.displayEmail || '',
            displayPhone: data.contact.displayPhone || '',
            whatsappNumber: data.contact.whatsappNumber || '',
            address: data.contact.address || '',
          },
        })
      })
      .catch((err) => setError(err.message))

  useEffect(() => {
    load()
  }, [])

  const patchSection = (section, patch) => {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }))
  }

  const save = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = await api.adminUpdateIntegrations({
        razorpay: form.razorpay,
        shiprocket: form.shiprocket,
        mail: {
          ...form.mail,
          port: Number(form.mail.port) || 587,
        },
        contact: form.contact,
      })
      setStatus(payload.integrations)
      setMessage(payload.message || 'Settings saved.')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const runTestEmail = async () => {
    if (!testEmail.trim()) {
      setError('Enter an email address for the test.')
      return
    }
    setTesting(true)
    setError('')
    setMessage('')
    try {
      const payload = await api.adminSendTestEmail(testEmail.trim())
      setMessage(payload.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setTesting(false)
    }
  }

  const runTestShiprocket = async () => {
    setTestingShiprocket(true)
    setError('')
    setMessage('')
    try {
      const payload = await api.adminTestShiprocket()
      setMessage(payload.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setTestingShiprocket(false)
    }
  }

  return (
    <div className="admin-v2-content__inner space-y-6 p-4 sm:p-6">
      <header className="admin-v2-page-header">
        <p className="admin-v2-page-header__eyebrow">Configuration</p>
        <h1 className="admin-v2-page-header__title">Integrations</h1>
        <p className="admin-v2-page-header__description">
          Manage Razorpay payments, Shiprocket shipping, SMTP mailer, and contact form email — saved securely in the database.
        </p>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
      ) : null}

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Razorpay Payments</h2>
            {status ? <StatusBadge configured={status.razorpay.configured} label="Razorpay" /> : null}
          </div>
          <div className="space-y-4">
            <AdminToggle
              checked={form.razorpay.enabled}
              onChange={(e) => patchSection('razorpay', { enabled: e.target.checked })}
              label="Enable Razorpay checkout"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Key ID</span>
                <input
                  value={form.razorpay.keyId}
                  onChange={(e) => patchSection('razorpay', { keyId: e.target.value })}
                  placeholder="rzp_test_…"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Key Secret</span>
                <input
                  type="password"
                  value={form.razorpay.keySecret}
                  onChange={(e) => patchSection('razorpay', { keySecret: e.target.value })}
                  placeholder={status?.razorpay.keySecretSet ? SECRET_PLACEHOLDER : 'Enter secret'}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Webhook Secret (optional)</span>
              <input
                type="password"
                value={form.razorpay.webhookSecret}
                onChange={(e) => patchSection('razorpay', { webhookSecret: e.target.value })}
                placeholder={status?.razorpay.webhookSecretSet ? SECRET_PLACEHOLDER : 'Webhook secret'}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Shiprocket Shipping</h2>
            {status ? <StatusBadge configured={status.shiprocket.configured} label="Shiprocket" /> : null}
          </div>
          <div className="space-y-4">
            <AdminToggle
              checked={form.shiprocket.enabled}
              onChange={(e) => patchSection('shiprocket', { enabled: e.target.checked })}
              label="Enable Shiprocket integration"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Account Email</span>
                <input
                  type="email"
                  value={form.shiprocket.email}
                  onChange={(e) => patchSection('shiprocket', { email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  value={form.shiprocket.password}
                  onChange={(e) => patchSection('shiprocket', { password: e.target.value })}
                  placeholder={status?.shiprocket.passwordSet ? SECRET_PLACEHOLDER : 'Enter password'}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">API Base URL</span>
              <input
                value={form.shiprocket.baseUrl}
                onChange={(e) => patchSection('shiprocket', { baseUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={runTestShiprocket}
              disabled={testingShiprocket}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-400 hover:text-orange-600 disabled:opacity-60"
            >
              <FiSend />
              {testingShiprocket ? 'Testing Shiprocket…' : 'Test Shiprocket connection'}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Email & Contact Mail</h2>
            {status ? <StatusBadge configured={status.mail.configured} label="Mailer" /> : null}
          </div>
          <div className="space-y-4">
            <AdminToggle
              checked={form.mail.enabled}
              onChange={(e) => patchSection('mail', { enabled: e.target.checked })}
              label="Enable SMTP mailer"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">SMTP Host</span>
                <input
                  value={form.mail.host}
                  onChange={(e) => patchSection('mail', { host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">SMTP Port</span>
                <input
                  type="number"
                  value={form.mail.port}
                  onChange={(e) => patchSection('mail', { port: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">SMTP Username</span>
                <input
                  value={form.mail.user}
                  onChange={(e) => patchSection('mail', { user: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">SMTP Password</span>
                <input
                  type="password"
                  value={form.mail.pass}
                  onChange={(e) => patchSection('mail', { pass: e.target.value })}
                  placeholder={status?.mail.passSet ? SECRET_PLACEHOLDER : 'App password'}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <AdminToggle
              checked={form.mail.secure}
              onChange={(e) => patchSection('mail', { secure: e.target.checked })}
              label="Use SSL (port 465)"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Sender (From)</span>
                <input
                  value={form.mail.from}
                  onChange={(e) => patchSection('mail', { from: e.target.value })}
                  placeholder="NamoPrint <no-reply@namoprint.com>"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Contact form receives at *</span>
                <input
                  type="email"
                  value={form.mail.contactToEmail}
                  onChange={(e) => patchSection('mail', { contactToEmail: e.target.value })}
                  placeholder="admin@yourstore.com"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <label className="block min-w-[220px] flex-1 space-y-1">
                <span className="text-sm font-medium text-slate-700">Send test email to</span>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <button type="button" onClick={runTestEmail} disabled={testing} className="admin-btn admin-btn--secondary">
                <FiSend className="mr-1 inline" />
                {testing ? 'Sending…' : 'Test mailer'}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Contact Page Display</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Public email shown</span>
              <input
                type="email"
                value={form.contact.displayEmail}
                onChange={(e) => patchSection('contact', { displayEmail: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Public phone</span>
              <input
                value={form.contact.displayPhone}
                onChange={(e) => patchSection('contact', { displayPhone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">WhatsApp number (digits only)</span>
              <input
                value={form.contact.whatsappNumber}
                onChange={(e) => patchSection('contact', { whatsappNumber: e.target.value })}
                placeholder="919098570277"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Address</span>
              <input
                value={form.contact.address}
                onChange={(e) => patchSection('contact', { address: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="button" onClick={save} disabled={saving} className="admin-btn admin-btn--primary">
            <FiSave className="mr-1 inline" />
            {saving ? 'Saving…' : 'Save all integrations'}
          </button>
        </div>
      </div>
    </div>
  )
}
