export function DashboardCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  className = '',
  children,
}) {
  return (
    <article className={`admin-v2-dashboard-card ${className}`.trim()}>
      <div className="admin-v2-dashboard-card__top">
        <div>
          <p className="admin-v2-dashboard-card__label">{label}</p>
          <strong className="admin-v2-dashboard-card__value">{value}</strong>
        </div>
        {Icon ? (
          <div className="admin-v2-dashboard-card__icon" aria-hidden="true">
            <Icon size={22} />
          </div>
        ) : null}
      </div>
      {trend != null || trendLabel ? (
        <p className="admin-v2-dashboard-card__trend">
          {trend != null ? <span>{trend}</span> : null}
          {trendLabel ? <small>{trendLabel}</small> : null}
        </p>
      ) : null}
      {children}
    </article>
  )
}
