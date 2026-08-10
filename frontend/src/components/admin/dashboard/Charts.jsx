import { motion } from 'framer-motion'
import { formatCurrency } from '../../../utils/format'
import { Skeleton } from '../ui/Loader'

const periods = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
]

export function RevenueChart({ data = [], period, onPeriodChange, loading = false }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const width = 560
  const height = 220
  const padding = 24
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0

  const points = data.map((item, index) => {
    const x = padding + index * step
    const y = height - padding - (item.value / max) * (height - padding * 2)
    return `${x},${y}`
  })

  const path = points.length ? `M ${points.join(' L ')}` : ''

  if (loading) {
    return (
      <section className="dash-panel">
        <Skeleton className="dash-chart-skeleton" />
      </section>
    )
  }

  return (
    <section className="dash-panel dash-panel--chart">
      <div className="dash-panel__head">
        <div>
          <h2>Revenue Analytics</h2>
          <p>Paid order revenue over time</p>
        </div>
        <div className="dash-segmented" role="tablist" aria-label="Revenue period">
          {periods.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={period === item.id}
              className={period === item.id ? 'is-active' : ''}
              onClick={() => onPeriodChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {!data.length ? (
        <p className="dash-panel__empty">No revenue data for this period.</p>
      ) : (
        <div className="dash-line-chart">
          <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Revenue line chart">
            <defs>
              <linearGradient id="dashLineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(99,102,241,0.35)" />
                <stop offset="100%" stopColor="rgba(99,102,241,0)" />
              </linearGradient>
            </defs>
            {path ? (
              <>
                <motion.path
                  d={`${path} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
                  fill="url(#dashLineFill)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <motion.path
                  d={path}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />
              </>
            ) : null}
            {data.map((item, index) => {
              const x = padding + index * step
              const y = height - padding - (item.value / max) * (height - padding * 2)
              return (
                <g key={item.label}>
                  <circle cx={x} cy={y} r="5" fill="#6366f1">
                    <title>{`${item.label}: ${formatCurrency(item.value)}`}</title>
                  </circle>
                </g>
              )
            })}
          </svg>
          <div className="dash-line-chart__labels">
            {data.map((item) => (
              <span key={item.label}>{item.label}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export function PieChartCard({ data = [], mode, onModeChange, loading = false, title = 'Sales Distribution' }) {
  const modes = [
    { id: 'orders', label: 'Orders' },
    { id: 'products', label: 'Products' },
    { id: 'categories', label: 'Categories' },
    { id: 'revenue', label: 'Revenue' },
  ]

  const total = data.reduce((sum, item) => sum + item.value, 0) || 1
  let cursor = 0
  const slices = data.map((item) => {
    const start = cursor
    const angle = (item.value / total) * 360
    cursor += angle
    return { ...item, start, angle }
  })

  const polar = (angle) => {
    const rad = ((angle - 90) * Math.PI) / 180
    return [80 + 56 * Math.cos(rad), 80 + 56 * Math.sin(rad)]
  }

  if (loading) {
    return (
      <section className="dash-panel">
        <Skeleton className="dash-chart-skeleton dash-chart-skeleton--round" />
      </section>
    )
  }

  return (
    <section className="dash-panel dash-panel--chart">
      <div className="dash-panel__head">
        <div>
          <h2>{title}</h2>
          <p>Distribution breakdown</p>
        </div>
        <div className="dash-segmented dash-segmented--wrap">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              className={mode === item.id ? 'is-active' : ''}
              onClick={() => onModeChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-pie">
        <motion.svg
          viewBox="0 0 160 160"
          initial={{ rotate: -20, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          role="img"
          aria-label="Distribution pie chart"
        >
          {slices.map((slice) => {
            const [x1, y1] = polar(slice.start)
            const [x2, y2] = polar(slice.start + slice.angle)
            const large = slice.angle > 180 ? 1 : 0
            const d = `M 80 80 L ${x1} ${y1} A 56 56 0 ${large} 1 ${x2} ${y2} Z`
            return <path key={slice.label} d={d} fill={slice.color} />
          })}
        </motion.svg>
        <ul className="dash-pie__legend">
          {data.map((item) => (
            <li key={item.label}>
              <span style={{ background: item.color }} aria-hidden="true" />
              {item.label}
              <strong>{Math.round((item.value / total) * 100)}%</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function BarChartCard({ title, subtitle, data = [], loading = false }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  if (loading) {
    return (
      <section className="dash-panel">
        <Skeleton className="dash-chart-skeleton" />
      </section>
    )
  }

  return (
    <section className="dash-panel dash-panel--chart">
      <div className="dash-panel__head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="dash-bar-chart">
        {data.map((item, index) => (
          <div key={item.label} className="dash-bar-chart__item">
            <motion.div
              className="dash-bar-chart__bar"
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(8, (item.value / max) * 100)}%` }}
              transition={{ delay: index * 0.05, duration: 0.45 }}
              title={`${item.label}: ${item.value}`}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
