import {
  Bell,
  CreditCard,
  Megaphone,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  Tag,
  Truck,
  User,
  Warehouse,
} from 'lucide-react'
import { formatNotifDate } from '../../../utils/notificationAdminUtils'

const TYPE_ICONS = {
  system: Settings,
  orders: ShoppingBag,
  payments: CreditCard,
  customers: User,
  inventory: Warehouse,
  products: Package,
  shipping: Truck,
  coupons: Tag,
  marketing: Megaphone,
  security: Shield,
}

export function PriorityBadge({ priority }) {
  return <span className={`ntf-priority ntf-priority--${priority || 'info'}`}>{priority || 'info'}</span>
}

export function TypeBadge({ type }) {
  return <span className="ntf-type-badge">{type}</span>
}

export function NotificationDashboard({ stats, loading }) {
  if (loading) {
    return (
      <div className="ntf-dashboard">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="ntf-stat-card ntf-skeleton" />
        ))}
      </div>
    )
  }

  const cards = [
    { label: 'Unread', value: stats.unread },
    { label: "Today's Notifications", value: stats.today },
    { label: 'Emails Sent', value: stats.emailsSent },
    { label: 'SMS Sent', value: stats.smsSent },
    { label: 'Push Notifications', value: stats.pushSent },
    { label: 'Failed', value: stats.failed },
    { label: 'Delivery Rate', value: `${stats.deliveryRate}%` },
    { label: 'Open Rate', value: stats.openRate },
    { label: 'Click Rate', value: stats.clickRate },
  ]

  return (
    <div className="ntf-dashboard">
      {cards.map((c) => (
        <article key={c.label} className="ntf-stat-card">
          <span>{c.label}</span>
          <strong>{c.value}</strong>
        </article>
      ))}
    </div>
  )
}

export function NotificationFeed({ items, onOpen, onPin, selected, onToggleSelect }) {
  if (!items.length) {
    return (
      <div className="ntf-empty">
        <Bell size={32} />
        <p>No notifications</p>
      </div>
    )
  }

  return (
    <ul className="ntf-feed">
      {items.map((item) => {
        const Icon = TYPE_ICONS[item.type] || Bell
        return (
          <li
            key={item.id}
            className={`ntf-feed-item ${item.unread ? 'is-unread' : ''} ${item.pinned ? 'is-pinned' : ''}`}
            onClick={() => onOpen(item)}
            onKeyDown={(e) => e.key === 'Enter' && onOpen(item)}
            role="button"
            tabIndex={0}
          >
            <label onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              <input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggleSelect(item.id)} />
            </label>
            <div className="ntf-feed-item__icon"><Icon size={18} /></div>
            <div className="ntf-feed-item__body">
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <div className="ntf-feed-item__meta">
                <TypeBadge type={item.type} />
                <PriorityBadge priority={item.priority} />
                <span>{item.recipient}</span>
              </div>
            </div>
            <time>{formatNotifDate(item.createdAt)}</time>
          </li>
        )
      })}
    </ul>
  )
}

export function NotificationTable({ items, onOpen, selected, onToggleSelect }) {
  if (!items.length) return <div className="ntf-empty"><p>No notifications</p></div>

  return (
    <div className="ntf-table-wrap">
      <table className="ntf-table">
        <thead>
          <tr>
            <th><input type="checkbox" aria-label="Select all" onChange={() => {}} /></th>
            <th>Title</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Recipient</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="ntf-table__row">
              <td><input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggleSelect(item.id)} /></td>
              <td><strong>{item.title}</strong><br /><small>{item.description}</small></td>
              <td><TypeBadge type={item.type} /></td>
              <td><PriorityBadge priority={item.priority} /></td>
              <td>{item.recipient}</td>
              <td>{item.status}</td>
              <td>{formatNotifDate(item.createdAt)}</td>
              <td><button type="button" className="ntf-btn ntf-btn--ghost ntf-btn--sm" onClick={() => onOpen(item)}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function NotificationDrawer({ item, onClose, onMarkRead, onPin }) {
  if (!item) return null
  const Icon = TYPE_ICONS[item.type] || Bell

  return (
    <>
      <button type="button" className="ntf-drawer-backdrop" aria-label="Close" onClick={onClose} />
      <aside className="ntf-drawer">
        <div className="ntf-drawer__head">
          <div className="ntf-feed-item__icon"><Icon size={20} /></div>
          <button type="button" className="ntf-icon-btn" onClick={onClose}>×</button>
        </div>
        <h2>{item.title}</h2>
        <p>{item.description}</p>
        <div className="ntf-feed-item__meta" style={{ marginBottom: 16 }}>
          <TypeBadge type={item.type} />
          <PriorityBadge priority={item.priority} />
        </div>
        <dl style={{ display: 'grid', gap: 8, fontSize: '0.875rem' }}>
          <div><dt style={{ color: 'var(--admin-text-muted)' }}>Recipient</dt><dd>{item.recipient}</dd></div>
          <div><dt style={{ color: 'var(--admin-text-muted)' }}>Status</dt><dd>{item.status}</dd></div>
          <div><dt style={{ color: 'var(--admin-text-muted)' }}>Created</dt><dd>{formatNotifDate(item.createdAt)}</dd></div>
        </dl>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          {item.unread ? (
            <button type="button" className="ntf-btn ntf-btn--primary" onClick={() => onMarkRead(item.id)}>Mark as read</button>
          ) : null}
          <button type="button" className="ntf-btn ntf-btn--ghost" onClick={() => onPin(item.id)}>{item.pinned ? 'Unpin' : 'Pin'}</button>
          {item.link ? (
            <a href={item.link} className="ntf-btn ntf-btn--ghost" onClick={onClose}>Open related</a>
          ) : null}
        </div>
      </aside>
    </>
  )
}
