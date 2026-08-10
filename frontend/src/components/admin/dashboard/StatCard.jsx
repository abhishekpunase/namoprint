import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { AnimatedCounter } from './AnimatedCounter'
import { Skeleton } from '../ui/Loader'

export function StatCard({
  title,
  value,
  numericValue,
  formatValue,
  icon: Icon,
  growth,
  comparison,
  trend = [],
  loading = false,
  error = '',
  tone = 'indigo',
  className = '',
}) {
  if (loading) {
    return (
      <article className={`dash-stat-card dash-stat-card--loading ${className}`.trim()}>
        <Skeleton className="dash-stat-card__skeleton-icon" />
        <Skeleton className="dash-stat-card__skeleton-line" />
        <Skeleton className="dash-stat-card__skeleton-line dash-stat-card__skeleton-line--short" />
      </article>
    )
  }

  if (error) {
    return (
      <article className={`dash-stat-card dash-stat-card--error ${className}`.trim()}>
        <p className="dash-stat-card__label">{title}</p>
        <p className="dash-stat-card__error">{error}</p>
      </article>
    )
  }

  const isUp = Number(growth) >= 0
  const maxTrend = Math.max(...trend.map((point) => point.value), 1)

  return (
    <motion.article
      className={`dash-stat-card dash-stat-card--${tone} ${className}`.trim()}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      <div className="dash-stat-card__head">
        <div className="dash-stat-card__icon" aria-hidden="true">
          {Icon ? <Icon size={22} /> : null}
        </div>
        {growth != null ? (
          <span className={`dash-stat-card__growth ${isUp ? 'is-up' : 'is-down'}`}>
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(growth).toFixed(1)}%
          </span>
        ) : null}
      </div>

      <p className="dash-stat-card__label">{title}</p>
      <strong className="dash-stat-card__value">
        {numericValue != null ? (
          <AnimatedCounter value={numericValue} format={formatValue || ((v) => String(Math.round(v)))} />
        ) : (
          value
        )}
      </strong>

      {comparison ? <small className="dash-stat-card__comparison">{comparison}</small> : null}

      {trend.length ? (
        <div className="dash-stat-card__spark" aria-hidden="true">
          {trend.map((point) => (
            <span
              key={point.label}
              style={{ height: `${Math.max(12, (point.value / maxTrend) * 100)}%` }}
            />
          ))}
        </div>
      ) : null}
    </motion.article>
  )
}

export function StatCardGrid({ children, className = '' }) {
  return <div className={`dash-stat-grid ${className}`.trim()}>{children}</div>
}
