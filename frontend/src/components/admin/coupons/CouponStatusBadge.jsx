export function CouponStatusBadge({ status }) {
  const tone = status || 'draft'
  return <span className={`cpn-status cpn-status--${tone}`}>{status || 'draft'}</span>
}
