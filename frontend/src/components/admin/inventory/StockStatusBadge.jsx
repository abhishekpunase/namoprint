export function StockStatusBadge({ status }) {
  if (!status) return null
  return <span className={`inv-status inv-status--${status.tone || status.key}`}>{status.label}</span>
}
