import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useNotificationBell } from '../../../hooks/useNotificationCenter'
import { formatNotifDate } from '../../../utils/notificationAdminUtils'
import { PriorityBadge, TypeBadge } from './NotificationFeed'

function DropdownPanel({ children, className = '' }) {
  return (
    <motion.div
      className={`admin-v2-dropdown ${className}`.trim()}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.16 }}
    >
      {children}
    </motion.div>
  )
}

export function NotificationBell({ onOpenChange }) {
  const { unread, preview, reload, markRead } = useNotificationBell()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    onOpenChange?.(open)
  }, [open, onOpenChange])

  const handleItemClick = (item) => {
    markRead(item.id)
    reload()
  }

  return (
    <div className="admin-v2-navbar__menu ntf-bell" ref={ref}>
      <button
        type="button"
        className="admin-v2-icon-btn"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((c) => !c)}
      >
        <Bell size={18} />
        {unread > 0 ? <span className="ntf-bell__badge">{unread > 99 ? '99+' : unread}</span> : null}
      </button>
      <AnimatePresence>
        {open ? (
          <DropdownPanel className="admin-v2-dropdown--panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <p className="admin-v2-dropdown__heading" style={{ margin: 0 }}>Notifications</p>
              <Link to="/admin/notifications" className="ntf-btn ntf-btn--ghost ntf-btn--sm" onClick={() => setOpen(false)}>
                View all
              </Link>
            </div>
            {!preview.length ? (
              <div className="ntf-empty" style={{ padding: 16 }}>
                <Bell size={24} />
                <p>No notifications</p>
              </div>
            ) : (
              <ul className="ntf-feed" style={{ maxHeight: 320, overflow: 'auto' }}>
                {preview.map((item) => (
                  <li
                    key={item.id}
                    className={`ntf-feed-item ${item.unread ? 'is-unread' : ''}`}
                    style={{ gridTemplateColumns: '1fr auto', padding: 10 }}
                  >
                    <Link
                      to={item.link || '/admin/notifications'}
                      onClick={() => {
                        handleItemClick(item)
                        setOpen(false)
                      }}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <strong style={{ display: 'block', fontSize: '0.8125rem' }}>{item.title}</strong>
                      <p style={{ margin: '2px 0', fontSize: '0.75rem' }}>{item.description}</p>
                      <div className="ntf-feed-item__meta">
                        <TypeBadge type={item.type} />
                        <PriorityBadge priority={item.priority} />
                      </div>
                    </Link>
                    <time style={{ fontSize: '0.6875rem' }}>{formatNotifDate(item.createdAt)}</time>
                  </li>
                ))}
              </ul>
            )}
          </DropdownPanel>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
