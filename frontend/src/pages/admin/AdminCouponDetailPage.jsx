import { Link, useParams } from 'react-router-dom'
import { useCouponDetail } from '../../hooks/useCouponList'
import { CouponTableSkeleton } from '../../components/admin/coupons/CouponTable'
import {
  CouponAnalytics,
  CouponDetailSummary,
  CouponTimeline,
  CouponUsageTable,
} from '../../components/admin/coupons/CouponDetailView'

export function AdminCouponDetailPage() {
  const { code } = useParams()
  const decoded = decodeURIComponent(code || '')
  const detail = useCouponDetail(decoded)

  if (detail.loading) {
    return (
      <div className="cpn-page">
        <CouponTableSkeleton />
      </div>
    )
  }

  if (detail.error || !detail.coupon) {
    return (
      <div className="cpn-page">
        <p className="cpn-message cpn-message--err">{detail.error || 'Coupon not found'}</p>
        <Link to="/admin/coupons" className="cpn-back-link">← Back to coupons</Link>
      </div>
    )
  }

  const { coupon } = detail

  return (
    <div className="cpn-page">
      <header className="cpn-page-header">
        <div>
          <nav className="cpn-breadcrumb">
            <Link to="/admin">Admin</Link> / <Link to="/admin/coupons">Coupons</Link> / <span>{coupon.code}</span>
          </nav>
          <h1>{coupon.name}</h1>
          <p>Coupon details & usage analytics</p>
        </div>
        <div className="cpn-quick-actions">
          <Link to={`/admin/coupons/${encodeURIComponent(coupon.code)}/edit`} className="cpn-btn cpn-btn--primary">Edit Coupon</Link>
          <Link to="/admin/coupons" className="cpn-btn cpn-btn--ghost">Back to list</Link>
        </div>
      </header>

      <div className="cpn-detail-grid">
        <div style={{ display: 'grid', gap: 16 }}>
          <CouponDetailSummary coupon={coupon} />
          <CouponUsageTable orders={coupon.usageOrders} />
        </div>
        <div style={{ display: 'grid', gap: 16 }}>
          <CouponAnalytics coupon={coupon} topCustomers={detail.topCustomers} topProducts={detail.topProducts} />
          <CouponTimeline activity={detail.activity} />
        </div>
      </div>
    </div>
  )
}
