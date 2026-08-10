export function FilterBar({ children, className = '' }) {
  return (
    <div className={`admin-v2-filter-bar ${className}`.trim()} role="toolbar" aria-label="Filters">
      {children}
    </div>
  )
}
