import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useNotificationBell } from '../../../hooks/useNotificationCenter'
import { formatNotifDate, markAsRead } from '../../../utils/notificationAdminUtils'
import { EmptyState } from '../ui/EmptyState'

export function NotificationPanel() {
  const { unread, preview, reload } = useNotificationBell()
  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(preview)
  }, [preview])

  const markAllRead = () => {
    items.forEach((item) => {
      if (item.unread) markAsRead(item.id)
    })
    reload()
  }

  return (
    <section className="dash-panel">
      <div className="dash-panel__head">
        <div>
          <h2>
            Notifications
            {unread ? <span className="dash-badge">{unread}</span> : null}
          </h2>
          <p className="dash-panel__todo">Live feed from orders, payments &amp; inventory</p>
        </div>
        <button type="button" className="dash-btn dash-btn--ghost" onClick={markAllRead} disabled={!unread}>
          Mark all read
        </button>
      </div>

      {!items.length ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <ul className="dash-notifications">
          {items.slice(0, 6).map((item) => (
            <li key={item.id} className={`dash-notifications__item ${item.unread ? 'is-unread' : ''}`}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <small>{formatNotifDate(item.createdAt)}</small>
            </li>
          ))}
        </ul>
      )}

      <Link to="/admin/notifications" className="dash-btn dash-btn--ghost dash-btn--full">
        View Communication Center
      </Link>
    </section>
  )
}
