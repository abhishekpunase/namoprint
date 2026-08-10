import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useCustomerDetail } from '../../hooks/useCustomerList'
import { buildCustomerActivity, getDefaultAddress } from '../../utils/customerAdminUtils'
import {
  CustomerProfileHero,
  CustomerInfoCard,
  CustomerAnalyticsCard,
  AddressList,
} from '../../components/admin/customers/CustomerProfile'
import { OrderHistory, PaymentHistory } from '../../components/admin/customers/OrderHistory'
import {
  WishlistCard,
  CartCard,
  ReviewList,
  LoyaltyCard,
  CommunicationCard,
} from '../../components/admin/customers/CustomerExtras'
import { CustomerNotes, ActivityTimeline } from '../../components/admin/customers/CustomerNotes'
import { CustomerProfileSkeleton } from '../../components/admin/customers/CustomersTable'

export function AdminCustomerDetailPage() {
  const { id } = useParams()
  const detail = useCustomerDetail(id)

  const activity = useMemo(
    () => (detail.customer ? buildCustomerActivity(detail.customer, detail.orders) : []),
    [detail.customer, detail.orders],
  )

  if (detail.loading) {
    return (
      <div className="crm-page">
        <CustomerProfileSkeleton />
      </div>
    )
  }

  if (detail.error && !detail.customer) {
    return (
      <div className="crm-page">
        <p className="crm-message crm-message--err">{detail.error}</p>
        <Link to="/admin/customers" className="crm-back-link">← Back to customers</Link>
      </div>
    )
  }

  const billing = detail.orders[0]?.billingAddress || getDefaultAddress(detail.customer)
  const shipping = detail.orders[0]?.shippingAddress || getDefaultAddress(detail.customer)

  return (
    <div className="crm-page crm-detail-page">
      {detail.message ? <p className="crm-message">{detail.message}</p> : null}
      {detail.error ? <p className="crm-message crm-message--warn">{detail.error}</p> : null}

      <CustomerProfileHero
        customer={detail.customer}
        onToggleBlock={detail.toggleBlock}
        onToggleVip={(vip) => detail.updateMeta({ vip })}
        saving={detail.saving}
      />

      <div className="crm-detail-grid">
        <CustomerInfoCard customer={detail.customer} />
        <CustomerAnalyticsCard stats={detail.customer?.stats} />
        <PaymentHistory orders={detail.orders} />
        <LoyaltyCard customer={detail.customer} />
        <CommunicationCard />
        <CustomerNotes notes={detail.notes} onAdd={detail.addNote} onDelete={detail.removeNote} />
        <ActivityTimeline events={activity} />
      </div>

      <AddressList addresses={detail.customer?.addresses || []} />

      <div className="crm-detail-grid crm-detail-grid--2">
        <section className="crm-panel">
          <h2>Billing Address (latest order)</h2>
          <pre className="crm-address-block">{billing ? [billing.line1, billing.city, billing.state].filter(Boolean).join(', ') : '—'}</pre>
        </section>
        <section className="crm-panel">
          <h2>Shipping Address (latest order)</h2>
          <pre className="crm-address-block">{shipping ? [shipping.line1, shipping.city, shipping.state].filter(Boolean).join(', ') : '—'}</pre>
        </section>
      </div>

      <OrderHistory orders={detail.orders} />

      <div className="crm-detail-grid crm-detail-grid--3">
        <WishlistCard />
        <CartCard />
        <ReviewList />
      </div>
    </div>
  )
}
