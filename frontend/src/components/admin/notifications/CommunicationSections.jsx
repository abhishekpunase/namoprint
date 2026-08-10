import { useState } from 'react'
import {
  EMAIL_TEMPLATES,
  SMS_TEMPLATES,
  WHATSAPP_NUMBER,
  formatNotifDate,
  getWhatsAppLink,
} from '../../../utils/notificationAdminUtils'
import { ADMIN_BRAND_NAME } from '../../../config/adminBrand'

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'admins', label: 'Admins' },
  { value: 'customers', label: 'Customers' },
  { value: 'vip', label: 'VIP Customers' },
  { value: 'specific', label: 'Specific Users' },
  { value: 'groups', label: 'User Groups' },
]

export function EmailCenter({ drafts, sent, onSend, onSaveDraft, onToast }) {
  const [view, setView] = useState('compose')
  const [form, setForm] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    templateId: '',
    audience: 'customers',
    schedule: '',
  })

  const applyTemplate = (tpl) => {
    setForm((f) => ({
      ...f,
      templateId: tpl.id,
      subject: tpl.subject,
      body: tpl.id === 'password_reset'
        ? `Hi {{name}},\n\nClick here to reset your password: {{resetLink}}\n\n— ${ADMIN_BRAND_NAME}`
        : `Hello {{name}},\n\n${tpl.subject}\n\n— ${ADMIN_BRAND_NAME} Team`,
    }))
  }

  const handleSend = () => {
    if (!form.to && form.audience === 'specific') {
      onToast?.('Enter recipient email', 'err')
      return
    }
    if (!form.subject.trim()) {
      onToast?.('Subject is required', 'err')
      return
    }
    onSend({ ...form, status: 'sent' })
    onToast?.('Email recorded locally — TODO: connect transactional email API', 'success')
    setForm({ to: '', cc: '', bcc: '', subject: '', body: '', templateId: '', audience: 'customers', schedule: '' })
  }

  const subTabs = [
    { value: 'inbox', label: 'Inbox' },
    { value: 'sent', label: 'Sent' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'drafts', label: 'Drafts' },
    { value: 'failed', label: 'Failed' },
    { value: 'templates', label: 'Templates' },
    { value: 'compose', label: 'Compose' },
  ]

  return (
    <div className="ntf-panel">
      <div className="ntf-toolbar">
        <h2 style={{ margin: 0 }}>Email Center</h2>
        <div className="ntf-tabs">
          {subTabs.map((t) => (
            <button key={t.value} type="button" className={`ntf-tab ${view === t.value ? 'is-active' : ''}`} onClick={() => setView(t.value)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="ntf-todo-hint">TODO: Backend email API supports password reset only. Outbound admin email is stored locally until a send API is available.</p>

      {view === 'templates' ? (
        <div className="ntf-templates">
          {EMAIL_TEMPLATES.map((tpl) => (
            <button key={tpl.id} type="button" className="ntf-template-card" onClick={() => { applyTemplate(tpl); setView('compose') }}>
              <strong>{tpl.label}</strong>
              <span>{tpl.subject || 'Custom subject'}</span>
            </button>
          ))}
        </div>
      ) : null}

      {view === 'compose' ? (
        <EmailComposer form={form} setForm={setForm} onSend={handleSend} onSaveDraft={() => {
          onSaveDraft(form)
          onToast?.('Draft saved locally', 'success')
        }} templates={EMAIL_TEMPLATES} onApplyTemplate={applyTemplate} />
      ) : null}

      {view === 'sent' ? (
        <MessageList items={sent.emails || []} emptyLabel="No sent emails" />
      ) : null}

      {view === 'drafts' ? (
        <MessageList items={drafts} emptyLabel="No drafts" onSelect={(d) => { setForm(d); setView('compose') }} />
      ) : null}

      {['inbox', 'scheduled', 'failed'].includes(view) ? (
        <div className="ntf-empty">
          <p>No {view} emails</p>
          <span className="ntf-todo-hint">TODO: Connect {view} mailbox API</span>
        </div>
      ) : null}
    </div>
  )
}

export function EmailComposer({ form, setForm, onSend, onSaveDraft, templates, onApplyTemplate }) {
  return (
    <div className="ntf-composer">
      <div className="ntf-templates" style={{ marginBottom: 8 }}>
        {templates.slice(0, 4).map((tpl) => (
          <button key={tpl.id} type="button" className="ntf-template-card" onClick={() => onApplyTemplate(tpl)}>
            <strong>{tpl.label}</strong>
          </button>
        ))}
      </div>
      <label>
        Audience
        <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
          {AUDIENCE_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </label>
      <label>
        To
        <input type="email" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="customer@example.com" />
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <label>CC<input type="text" value={form.cc} onChange={(e) => setForm({ ...form, cc: e.target.value })} /></label>
        <label>BCC<input type="text" value={form.bcc} onChange={(e) => setForm({ ...form, bcc: e.target.value })} /></label>
      </div>
      <label>
        Subject
        <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
      </label>
      <label>
        Body
        <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={8} placeholder="Use {{name}}, {{orderNo}}, {{product}} variables" />
      </label>
      <label>
        Schedule (optional)
        <input type="datetime-local" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" className="ntf-btn ntf-btn--primary" onClick={onSend}>Send</button>
        <button type="button" className="ntf-btn ntf-btn--ghost" onClick={onSaveDraft}>Save draft</button>
        <button type="button" className="ntf-btn ntf-btn--ghost" disabled title="TODO: preview API">Preview</button>
        <button type="button" className="ntf-btn ntf-btn--ghost" disabled title="TODO: test send API">Send test</button>
      </div>
    </div>
  )
}

export function SmsCenter({ sent, onSend, onToast }) {
  const [form, setForm] = useState({ to: '', body: '', audience: 'customers', schedule: '' })

  const handleSend = () => {
    if (!form.to.trim()) {
      onToast?.('Phone number required', 'err')
      return
    }
    onSend(form)
    onToast?.('SMS queued locally — TODO: connect SMS provider', 'success')
    setForm({ to: '', body: '', audience: 'customers', schedule: '' })
  }

  return (
    <div className="ntf-panel">
      <h2>SMS Center</h2>
      <p className="ntf-todo-hint">TODO: No SMS API in backend. Messages are recorded in localStorage for UI preview.</p>
      <div className="ntf-templates" style={{ marginBottom: 16 }}>
        {SMS_TEMPLATES.map((tpl) => (
          <button key={tpl.id} type="button" className="ntf-template-card" onClick={() => setForm((f) => ({ ...f, body: tpl.body }))}>
            <strong>{tpl.label}</strong>
            <span>{tpl.body}</span>
          </button>
        ))}
      </div>
      <div className="ntf-composer">
        <label>To<input type="tel" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="+91XXXXXXXXXX" /></label>
        <label>Message<textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} /></label>
        <button type="button" className="ntf-btn ntf-btn--primary" onClick={handleSend}>Queue SMS</button>
      </div>
      <h3 style={{ marginTop: 24, fontSize: '0.9375rem' }}>Delivery reports</h3>
      <MessageList items={sent.sms || []} emptyLabel="No SMS messages" />
    </div>
  )
}

export function WhatsAppCenter({ onToast }) {
  const [message, setMessage] = useState(`Hello from ${ADMIN_BRAND_NAME} admin panel`)
  const link = getWhatsAppLink(message)

  return (
    <div className="ntf-panel">
      <h2>WhatsApp Center</h2>
      <p className="ntf-todo-hint">
        Reuses storefront WhatsApp link ({WHATSAPP_NUMBER}). TODO: Admin broadcast API, templates, and delivery status.
      </p>
      <div className="ntf-composer">
        <label>
          Quick message
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <a href={link} target="_blank" rel="noreferrer" className="ntf-btn ntf-btn--whatsapp">Open WhatsApp</a>
          <button type="button" className="ntf-btn ntf-btn--ghost" disabled title="TODO">Broadcast</button>
          <button type="button" className="ntf-btn ntf-btn--ghost" disabled title="TODO">Templates</button>
        </div>
      </div>
      <div className="ntf-empty" style={{ marginTop: 16 }}>
        <p>No message history</p>
        <span className="ntf-todo-hint">TODO: WhatsApp Business API integration</span>
      </div>
    </div>
  )
}

export function PushCenter({ sent, onSchedule, onToast }) {
  const [form, setForm] = useState({
    title: '',
    message: '',
    image: '',
    deepLink: '',
    audience: 'customers',
    schedule: '',
    priority: 'normal',
  })

  const handleSchedule = () => {
    if (!form.title.trim()) {
      onToast?.('Title required', 'err')
      return
    }
    onSchedule(form)
    onToast?.('Push scheduled locally — TODO: connect FCM / push provider', 'success')
    setForm({ title: '', message: '', image: '', deepLink: '', audience: 'customers', schedule: '', priority: 'normal' })
  }

  return (
    <div className="ntf-panel">
      <h2>Push Notifications</h2>
      <p className="ntf-todo-hint">TODO: No push notification API in backend.</p>
      <div className="ntf-composer">
        <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label>Message<textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} /></label>
        <label>Image URL<input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" /></label>
        <label>Deep link<input value={form.deepLink} onChange={(e) => setForm({ ...form, deepLink: e.target.value })} placeholder="/products/…" /></label>
        <label>
          Audience
          <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
            {AUDIENCE_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </label>
        <label>
          Priority
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label>Schedule<input type="datetime-local" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} /></label>
        <button type="button" className="ntf-btn ntf-btn--primary" onClick={handleSchedule}>Schedule push</button>
      </div>
      <h3 style={{ marginTop: 24, fontSize: '0.9375rem' }}>Scheduled / sent</h3>
      <MessageList items={sent.push || []} emptyLabel="No push messages" />
    </div>
  )
}

export function AnnouncementManager({ announcements, onCreate, onToast }) {
  const [form, setForm] = useState({ title: '', body: '', type: 'banner', active: true })

  const handleCreate = () => {
    if (!form.title.trim()) {
      onToast?.('Title required', 'err')
      return
    }
    onCreate(form)
    onToast?.('Announcement saved locally', 'success')
    setForm({ title: '', body: '', type: 'banner', active: true })
  }

  const types = ['banner', 'popup', 'maintenance', 'release_notes']

  return (
    <div className="ntf-panel">
      <h2>Announcement Center</h2>
      <p className="ntf-todo-hint">TODO: Publish announcements to storefront — stored locally for now.</p>
      <div className="ntf-composer">
        <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label>Body<textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} /></label>
        <label>
          Type
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {types.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </label>
        <button type="button" className="ntf-btn ntf-btn--primary" onClick={handleCreate}>Create announcement</button>
      </div>
      {announcements.length ? (
        <ul className="ntf-timeline" style={{ marginTop: 16 }}>
          {announcements.map((a) => (
            <li key={a.id}>
              <strong>{a.title}</strong> · {a.type}
              <p style={{ margin: '4px 0 0' }}>{a.body}</p>
              <time>{formatNotifDate(a.createdAt)}</time>
            </li>
          ))}
        </ul>
      ) : (
        <div className="ntf-empty"><p>No announcements</p></div>
      )}
    </div>
  )
}

export function AutomationRulesPanel({ rules, onUpdate }) {
  return (
    <div className="ntf-panel">
      <h2>Automation Rules</h2>
      <p className="ntf-todo-hint">Toggle rules locally — backend automation engine not available yet.</p>
      <div className="ntf-automation-list">
        {rules.map((rule) => (
          <div key={rule.id} className="ntf-automation-row">
            <div>
              <strong>{rule.event}</strong>
              <div style={{ fontSize: '0.8125rem', color: 'var(--admin-text-muted)' }}>{rule.channel}</div>
              {rule.todo ? <span className="ntf-todo-hint" style={{ display: 'inline-block', marginTop: 4, padding: '2px 8px' }}>TODO: API</span> : null}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={() => onUpdate(rules.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r)))}
              />
              Enabled
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ActivityTimeline({ activity, sent }) {
  const channels = [
    ...(sent.emails || []).map((e) => ({ ...e, channel: 'email', action: 'Email sent', timestamp: e.sentAt })),
    ...(sent.sms || []).map((s) => ({ ...s, channel: 'sms', action: 'SMS queued', timestamp: s.sentAt })),
    ...(sent.push || []).map((p) => ({ ...p, channel: 'push', action: 'Push scheduled', timestamp: p.sentAt })),
    ...activity,
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  if (!channels.length) {
    return <div className="ntf-empty"><p>No activity yet</p></div>
  }

  return (
    <ul className="ntf-timeline">
      {channels.slice(0, 100).map((entry) => (
        <li key={entry.id}>
          <strong>{entry.action}</strong>
          {entry.detail ? ` — ${entry.detail}` : ''}
          {entry.channel ? ` · ${entry.channel}` : ''}
          <time>{formatNotifDate(entry.timestamp)}</time>
        </li>
      ))}
    </ul>
  )
}

export function AnalyticsSummary({ dashboard }) {
  const metrics = [
    { label: 'Delivery Rate', value: `${dashboard.deliveryRate}%` },
    { label: 'Open Rate', value: dashboard.openRate },
    { label: 'Click Rate', value: dashboard.clickRate },
    { label: 'Failed', value: dashboard.failed },
    { label: 'Emails Sent', value: dashboard.emailsSent },
    { label: 'SMS Sent', value: dashboard.smsSent },
  ]

  return (
    <div className="ntf-dashboard" style={{ marginTop: 12 }}>
      {metrics.map((m) => (
        <article key={m.label} className="ntf-stat-card">
          <span>{m.label}</span>
          <strong>{m.value}</strong>
        </article>
      ))}
      <p className="ntf-todo-hint" style={{ gridColumn: '1 / -1' }}>Open/click/bounce rates require email tracking API — shown as placeholders.</p>
    </div>
  )
}

function MessageList({ items, emptyLabel, onSelect }) {
  if (!items.length) return <div className="ntf-empty"><p>{emptyLabel}</p></div>

  return (
    <ul className="ntf-timeline">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSelect?.(item)}
            style={{ all: 'unset', cursor: onSelect ? 'pointer' : 'default', display: 'block', width: '100%' }}
          >
            <strong>{item.subject || item.title || item.to || item.body?.slice(0, 40)}</strong>
            <time>{formatNotifDate(item.sentAt || item.updatedAt)}</time>
          </button>
        </li>
      ))}
    </ul>
  )
}
