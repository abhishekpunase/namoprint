export function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1) return null

  const prev = () => onPageChange?.(Math.max(1, page - 1))
  const next = () => onPageChange?.(Math.min(totalPages, page + 1))

  return (
    <nav className={`admin-v2-pagination ${className}`.trim()} aria-label="Pagination">
      <button type="button" onClick={prev} disabled={page <= 1} className="admin-v2-pagination__btn">
        Previous
      </button>
      <span className="admin-v2-pagination__meta">
        Page {page} of {totalPages}
      </span>
      <button type="button" onClick={next} disabled={page >= totalPages} className="admin-v2-pagination__btn">
        Next
      </button>
    </nav>
  )
}
