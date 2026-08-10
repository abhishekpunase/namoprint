import {
  CreditCard,
  LogIn,
  Package,
  ShoppingBag,
  UserPlus,
  Warehouse,
} from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton } from '../ui/Loader'

const iconMap = {
  order: ShoppingBag,
  payment: CreditCard,
  customer: UserPlus,
  product: Package,
  inventory: Warehouse,
  login: LogIn,
}

const formatTime = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(value))
    : '—'

export function ActivityTimeline({ events = [], loading = false }) {
  if (loading) {
    return (
      <section className="dash-panel">
        <Skeleton className="dash-table-skeleton" />
      </section>
    )
  }

  return (
    <section className="dash-panel">
      <div className="dash-panel__head">
        <div>
          <h2>Recent Activity</h2>
          <p>Live feed from orders and customer registrations</p>
        </div>
      </div>

      {!events.length ? (
        <EmptyState title="No recent activity" description="Store events will appear here automatically." />
      ) : (
        <ol className="dash-timeline">
          {events.map((event) => {
            const Icon = iconMap[event.type] || ShoppingBag
            return (
              <li key={event.id} className="dash-timeline__item">
                <div className="dash-timeline__icon" aria-hidden="true">
                  <Icon size={16} />
                </div>
                <div className="dash-timeline__body">
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                  <small>
                    {formatTime(event.timestamp)} · {event.user}
                  </small>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
