export function Loader({ label = 'Loading…', className = '', size = 'md' }) {
  const sizeClass = size === 'sm' ? 'admin-v2-loader--sm' : size === 'lg' ? 'admin-v2-loader--lg' : ''

  return (
    <div className={`admin-v2-loader ${sizeClass} ${className}`.trim()} role="status" aria-live="polite">
      <span className="admin-v2-loader__spinner" aria-hidden="true" />
      {label ? <span className="admin-v2-loader__label">{label}</span> : null}
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`admin-v2-skeleton ${className}`.trim()} aria-hidden="true" />
}

export function PageSkeleton() {
  return (
    <div className="admin-v2-page-skeleton" aria-hidden="true">
      <Skeleton className="admin-v2-page-skeleton__title" />
      <div className="admin-v2-page-skeleton__grid">
        <Skeleton className="admin-v2-page-skeleton__card" />
        <Skeleton className="admin-v2-page-skeleton__card" />
        <Skeleton className="admin-v2-page-skeleton__card" />
        <Skeleton className="admin-v2-page-skeleton__card" />
      </div>
      <Skeleton className="admin-v2-page-skeleton__panel" />
    </div>
  )
}
