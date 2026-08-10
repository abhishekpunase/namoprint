import { Link } from 'react-router-dom'
import {
  Calendar,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldBan,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { formatCurrency } from '../../../utils/format'
import { formatAddress } from '../../../utils/orderAdminUtils'
import {
  formatCustomerDate,
  getCustomerId,
  getCustomerInitials,
  getDefaultAddress,
} from '../../../utils/customerAdminUtils'

export function CustomerProfileHero({ customer, onToggleBlock, onToggleVip, saving }) {
  if (!customer) return null
  const id = getCustomerId(customer)

  return (
    <section className="crm-panel crm-profile-hero">
      <span className="crm-avatar crm-avatar--lg">{getCustomerInitials(customer.name)}</span>
      <div>
        <div className="crm-profile-hero__title">
          <h1>{customer.name}</h1>
          {customer.meta?.vip ? <span className="crm-badge crm-badge--vip"><Star size={14} /> VIP</span> : null}
        </div>
        <p>{customer.email}</p>
        <div className="crm-profile-badges">
          <span className={`crm-status ${customer.isActive !== false ? 'is-active' : 'is-blocked'}`}>
            {customer.isActive !== false ? 'Active' : 'Blocked'}
          </span>
          <span className="crm-badge">Customer since {formatCustomerDate(customer.createdAt).split(',')[0]}</span>
        </div>
      </div>
      <div className="crm-profile-actions">
        <button type="button" className="crm-btn crm-btn--ghost" onClick={() => onToggleVip(!customer.meta?.vip)}>
          <Star size={16} /> {customer.meta?.vip ? 'Remove VIP' : 'Mark VIP'}
        </button>
        <button type="button" className="crm-btn crm-btn--ghost" disabled title="TODO: send email API"><Mail size={16} /> Email (TODO)</button>
        <button type="button" className="crm-btn crm-btn--ghost" disabled title="TODO: WhatsApp API"><MessageCircle size={16} /> WhatsApp (TODO)</button>
        <button type="button" className="crm-btn crm-btn--ghost" onClick={onToggleBlock} disabled={saving}>
          {customer.isActive !== false ? <><ShieldBan size={16} /> Block</> : <><ShieldCheck size={16} /> Unblock</>}
        </button>
        <Link to="/admin/customers" className="crm-btn crm-btn--ghost">← Back</Link>
      </div>
      <p className="crm-id-line">Customer ID: <code>{id}</code></p>
    </section>
  )
}

export function CustomerInfoCard({ customer }) {
  if (!customer) return null
  const defaultAddr = getDefaultAddress(customer)

  return (
    <section className="crm-panel">
      <h2>Customer Information</h2>
      <dl className="crm-dl">
        <div><dt><Mail size={14} /> Email</dt><dd>{customer.email}</dd></div>
        <div><dt><Phone size={14} /> Phone</dt><dd>{customer.phone || '—'}</dd></div>
        <div><dt><Calendar size={14} /> Birthday</dt><dd>{customer.specialDate ? formatCustomerDate(customer.specialDate).split(',')[0] : '—'}</dd></div>
        <div><dt><Globe size={14} /> Special Date Label</dt><dd>{customer.specialDateLabel || '—'}</dd></div>
        <div><dt>Last Login</dt><dd>{formatCustomerDate(customer.meta?.lastLogin)} <small className="crm-todo">(local — TODO: login history API)</small></dd></div>
        <div><dt>Language / Timezone</dt><dd className="crm-todo">— (TODO: profile preferences API)</dd></div>
      </dl>
      {defaultAddr ? (
        <p className="crm-address-preview"><MapPin size={14} /> {formatAddress(defaultAddr).split('\n').slice(0, 2).join(', ')}</p>
      ) : (
        <p className="crm-empty-inline">No saved addresses</p>
      )}
    </section>
  )
}

export function CustomerAnalyticsCard({ stats }) {
  if (!stats) return null
  return (
    <section className="crm-panel">
      <h2>Customer Analytics</h2>
      <div className="crm-analytics crm-analytics--detail">
        <div className="crm-analytics__card"><span>Total Orders</span><strong>{stats.totalOrders}</strong></div>
        <div className="crm-analytics__card"><span>Completed</span><strong>{stats.completedOrders}</strong></div>
        <div className="crm-analytics__card"><span>Cancelled</span><strong>{stats.cancelledOrders}</strong></div>
        <div className="crm-analytics__card"><span>Refunds</span><strong>{stats.refunds}</strong></div>
        <div className="crm-analytics__card"><span>Avg Order Value</span><strong>{formatCurrency(stats.averageOrderValue)}</strong></div>
        <div className="crm-analytics__card"><span>Lifetime Value</span><strong>{formatCurrency(stats.lifetimeValue)}</strong></div>
        <div className="crm-analytics__card"><span>Products Purchased</span><strong>{stats.productsPurchased}</strong></div>
        <div className="crm-analytics__card"><span>Last Purchase</span><strong>{stats.lastPurchase ? formatCustomerDate(stats.lastPurchase) : '—'}</strong></div>
      </div>
    </section>
  )
}

export function AddressCard({ title, address }) {
  const mapsQuery = address
    ? encodeURIComponent([address.line1, address.city, address.state, address.pincode, address.country].filter(Boolean).join(', '))
    : ''

  return (
    <section className="crm-panel crm-address-card">
      <h2>{title}</h2>
      {!address ? (
        <p className="crm-empty-inline">No address on file</p>
      ) : (
        <>
          <pre className="crm-address-block">{formatAddress(address)}</pre>
          {address.isDefault ? <span className="crm-badge">Default</span> : null}
          {mapsQuery ? (
            <a href={`https://maps.google.com/?q=${mapsQuery}`} target="_blank" rel="noreferrer" className="crm-btn crm-btn--ghost">
              <MapPin size={16} /> Open in Maps
            </a>
          ) : null}
        </>
      )}
    </section>
  )
}

export function AddressList({ addresses = [] }) {
  if (!addresses.length) {
    return <section className="crm-panel"><h2>Addresses</h2><p className="crm-empty-inline">No addresses saved.</p></section>
  }

  return (
    <section className="crm-panel crm-panel--wide">
      <h2>Addresses ({addresses.length})</h2>
      <div className="crm-address-grid">
        {addresses.map((addr) => (
          <article key={addr._id} className="crm-address-card">
            <h3>{addr.fullName}{addr.isDefault ? ' · Default' : ''}</h3>
            <pre className="crm-address-block">{formatAddress(addr)}</pre>
          </article>
        ))}
      </div>
    </section>
  )
}
