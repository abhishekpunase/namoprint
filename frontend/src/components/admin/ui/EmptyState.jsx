import { Inbox } from 'lucide-react'

export function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = 'Content will appear here once available.',
  action = null,
  className = '',
}) {
  return (
    <div className={`admin-v2-empty ${className}`.trim()} role="status">
      <div className="admin-v2-empty__icon-wrap">
        <Icon size={28} aria-hidden="true" />
      </div>
      <h3 className="admin-v2-empty__title">{title}</h3>
      <p className="admin-v2-empty__description">{description}</p>
      {action ? <div className="admin-v2-empty__action">{action}</div> : null}
    </div>
  )
}
