import { useState } from 'react'
import { DISCOUNT_TYPES } from '../../../utils/couponAdminUtils'

const STEPS = [
  'Basic Info',
  'Discount Type',
  'Discount Value',
  'Usage Limits',
  'Validity',
  'Eligibility',
  'Restrictions',
  'Review',
]

export function CouponWizard({ form, setForm, step, setStep, onSave, saving, isBackend }) {
  const update = (patch) => setForm((f) => ({ ...f, ...patch }))

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <div className="cpn-wizard">
      {isBackend ? (
        <p className="cpn-message cpn-message--warn">
          This coupon is defined in backend constants. You can edit display metadata locally; discount rules cannot be changed without a backend API.
        </p>
      ) : null}

      <div className="cpn-wizard__steps">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`cpn-wizard__step ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}
            onClick={() => setStep(i)}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div className="cpn-wizard__body">
        {step === 0 && <StepBasic form={form} update={update} isBackend={isBackend} />}
        {step === 1 && <StepType form={form} update={update} isBackend={isBackend} />}
        {step === 2 && <StepValue form={form} update={update} isBackend={isBackend} />}
        {step === 3 && <StepUsage form={form} update={update} />}
        {step === 4 && <StepValidity form={form} update={update} />}
        {step === 5 && <StepEligibility form={form} update={update} isBackend={isBackend} />}
        {step === 6 && <StepRestrictions form={form} update={update} isBackend={isBackend} />}
        {step === 7 && <StepReview form={form} isBackend={isBackend} />}
      </div>

      <div className="cpn-wizard__actions">
        <button type="button" className="cpn-btn cpn-btn--ghost" disabled={step === 0} onClick={prev}>Back</button>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {step < STEPS.length - 1 ? (
            <button type="button" className="cpn-btn cpn-btn--primary" onClick={next}>Continue</button>
          ) : (
            <>
              <button type="button" className="cpn-btn cpn-btn--ghost" disabled={saving} onClick={() => onSave(false)}>Save Draft</button>
              <button type="button" className="cpn-btn cpn-btn--primary" disabled={saving} onClick={() => onSave(true)}>
                {saving ? 'Saving…' : 'Publish'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StepBasic({ form, update, isBackend }) {
  return (
    <div className="cpn-form cpn-form--grid">
      <label>
        Coupon Name *
        <input value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="Summer Sale 20% Off" />
      </label>
      <label>
        Coupon Code *
        <input
          value={form.code}
          onChange={(e) => update({ code: e.target.value.toUpperCase() })}
          placeholder="SUMMER20"
          disabled={isBackend}
        />
      </label>
      <label style={{ gridColumn: '1 / -1' }}>
        Description
        <textarea value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="Customer-facing description" />
      </label>
      <label style={{ gridColumn: '1 / -1' }}>
        Internal Notes
        <textarea value={form.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Internal team notes" />
      </label>
    </div>
  )
}

function StepType({ form, update, isBackend }) {
  return (
    <div className="cpn-type-grid">
      {DISCOUNT_TYPES.map((t) => (
        <button
          key={t.value}
          type="button"
          disabled={isBackend || t.todo}
          className={`cpn-type-card ${form.type === t.value ? 'is-selected' : ''} ${t.todo || isBackend ? 'is-disabled' : ''}`}
          onClick={() => !t.todo && !isBackend && update({ type: t.value })}
          title={t.todo ? 'TODO: backend support required' : isBackend ? 'Cannot change live coupon type' : ''}
        >
          <strong>{t.label}</strong>
          <span>{t.todo ? 'Requires backend API' : form.type === t.value ? 'Selected' : 'Click to select'}</span>
        </button>
      ))}
    </div>
  )
}

function StepValue({ form, update, isBackend }) {
  return (
    <div className="cpn-form cpn-form--grid">
      {form.type === 'percent' ? (
        <label>
          Discount Percentage
          <input type="number" min={1} max={100} value={form.value} disabled={isBackend} onChange={(e) => update({ value: e.target.value })} />
        </label>
      ) : null}
      <label>
        Maximum Discount (₹)
        <input type="number" value={form.maxDiscount} onChange={(e) => update({ maxDiscount: e.target.value })} placeholder="Optional cap" />
      </label>
      <label>
        Minimum Cart Value (₹)
        <input type="number" value={form.minCart || form.minSubtotal} disabled={isBackend} onChange={(e) => update({ minCart: e.target.value, minSubtotal: e.target.value })} />
      </label>
      <label>
        Maximum Cart Value (₹)
        <input type="number" value={form.maxCart} onChange={(e) => update({ maxCart: e.target.value })} placeholder="Optional" />
      </label>
      {form.type !== 'percent' && form.type !== 'free_shipping' ? (
        <p className="cpn-todo-hint" style={{ gridColumn: '1 / -1' }}>TODO: Value rules for this discount type require backend promotion engine.</p>
      ) : null}
    </div>
  )
}

function StepUsage({ form, update }) {
  return (
    <div className="cpn-form cpn-form--grid">
      <label>
        Maximum Total Uses
        <input type="number" min={0} value={form.maxUsage} onChange={(e) => update({ maxUsage: e.target.value })} placeholder="Unlimited if empty" />
      </label>
      <label>
        Maximum Uses Per Customer
        <input type="number" min={1} value={form.maxPerCustomer} onChange={(e) => update({ maxPerCustomer: e.target.value })} />
      </label>
      <label className="cpn-form__check">
        <input type="checkbox" checked={form.guestAllowed} onChange={(e) => update({ guestAllowed: e.target.checked })} />
        Guest checkout allowed
      </label>
      <label className="cpn-form__check">
        <input type="checkbox" checked={form.stackable} onChange={(e) => update({ stackable: e.target.checked })} disabled title="TODO: stackable coupons not supported at checkout" />
        Stackable with other coupons (TODO)
      </label>
      <label className="cpn-form__check">
        <input type="checkbox" checked={form.autoApply} onChange={(e) => update({ autoApply: e.target.checked })} disabled title="TODO: auto-apply promotions" />
        Auto apply at checkout (TODO)
      </label>
    </div>
  )
}

function StepValidity({ form, update }) {
  return (
    <div className="cpn-form cpn-form--grid">
      <label>
        Start Date
        <input type="date" value={form.startDate} onChange={(e) => update({ startDate: e.target.value })} />
      </label>
      <label>
        Start Time
        <input type="time" value={form.startTime} onChange={(e) => update({ startTime: e.target.value })} />
      </label>
      <label>
        Expiry Date
        <input type="date" value={form.expiryDate} onChange={(e) => update({ expiryDate: e.target.value })} />
      </label>
      <label>
        Expiry Time
        <input type="time" value={form.expiryTime} onChange={(e) => update({ expiryTime: e.target.value })} />
      </label>
      <label>
        Timezone
        <select value={form.timezone} onChange={(e) => update({ timezone: e.target.value })}>
          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
          <option value="UTC">UTC</option>
        </select>
      </label>
    </div>
  )
}

function StepEligibility({ form, update, isBackend }) {
  return (
    <div className="cpn-form">
      <label>
        Applies To
        <select value={form.appliesTo} onChange={(e) => update({ appliesTo: e.target.value })} disabled={isBackend}>
          <option value="all">All products</option>
          <option value="products">Selected products (TODO)</option>
          <option value="categories">Selected categories (TODO)</option>
          <option value="brands">Selected brands (TODO)</option>
        </select>
      </label>
      {form.appliesTo !== 'all' ? (
        <p className="cpn-todo-hint">TODO: Product/category/brand picker requires admin coupon API and catalog integration.</p>
      ) : null}
      <label>
        Customer Eligibility
        <select defaultValue="all" disabled title="TODO: customer groups API">
          <option value="all">All customers</option>
          <option value="new">New customers (TODO)</option>
          <option value="returning">Returning customers (TODO)</option>
          <option value="vip">VIP customers (TODO)</option>
        </select>
      </label>
    </div>
  )
}

function StepRestrictions({ form, update, isBackend }) {
  return (
    <div className="cpn-form">
      <label className="cpn-form__check">
        <input type="checkbox" checked={form.firstOrderOnly} disabled={isBackend} onChange={(e) => update({ firstOrderOnly: e.target.checked })} />
        First order only
      </label>
      <label>
        Minimum quantity
        <input type="number" min={0} value={form.minQuantity} disabled={isBackend} onChange={(e) => update({ minQuantity: e.target.value })} />
      </label>
      <label className="cpn-form__check">
        <input type="checkbox" checked={form.excludeSale} onChange={(e) => update({ excludeSale: e.target.checked })} disabled title="TODO" />
        Exclude sale products (TODO)
      </label>
      <p className="cpn-todo-hint">Exclude categories, brands, and specific customers — TODO when admin coupon API is available.</p>
    </div>
  )
}

function StepReview({ form, isBackend }) {
  const typeLabel = DISCOUNT_TYPES.find((t) => t.value === form.type)?.label || form.type
  return (
    <div className="cpn-review">
      <h3>Preview</h3>
      <dl>
        <dt>Name</dt><dd>{form.name || '—'}</dd>
        <dt>Code</dt><dd><code>{form.code || '—'}</code></dd>
        <dt>Type</dt><dd>{typeLabel}</dd>
        <dt>Value</dt><dd>{form.type === 'percent' ? `${form.value}%` : form.type === 'free_shipping' ? 'Free shipping' : '—'}</dd>
        <dt>Min cart</dt><dd>{form.minCart || form.minSubtotal ? `₹${form.minCart || form.minSubtotal}` : 'None'}</dd>
        <dt>Max uses</dt><dd>{form.maxUsage || 'Unlimited'}</dd>
        <dt>Validity</dt><dd>{form.startDate || 'Immediate'} → {form.expiryDate || 'No expiry'}</dd>
        <dt>Source</dt><dd>{isBackend ? 'Backend constant (metadata only)' : 'Local draft (TODO: POST /admin/coupons)'}</dd>
      </dl>
    </div>
  )
}

export function CouponImportExportModal({ open, onClose, onImport }) {
  const [text, setText] = useState('')
  if (!open) return null

  const handleImport = () => {
    onImport?.(text)
    setText('')
    onClose()
  }

  return (
    <div className="cpn-modal-backdrop" onClick={onClose}>
      <div className="cpn-modal cpn-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="cpn-modal__head">
          <div>
            <h2>Import Coupons</h2>
            <p>Paste CSV: Code, Name, Type, Value, Status</p>
          </div>
          <button type="button" className="cpn-btn cpn-btn--ghost" onClick={onClose}>Close</button>
        </div>
        <p className="cpn-todo-hint">TODO: Full CSV/Excel import requires POST /admin/coupons. Imports are saved as local drafts only.</p>
        <textarea
          className="cpn-form"
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="WELCOME10,Welcome Offer,percent,10,active"
        />
        <div className="cpn-modal__actions">
          <a href="#" className="cpn-btn cpn-btn--ghost" onClick={(e) => { e.preventDefault(); downloadTemplate() }}>Sample Template</a>
          <button type="button" className="cpn-btn cpn-btn--primary" onClick={handleImport}>Import as Drafts</button>
        </div>
      </div>
    </div>
  )
}

function downloadTemplate() {
  const csv = 'Code,Name,Type,Value,Status\nSAMPLE10,Sample Offer,percent,10,draft'
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'coupon-import-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}
