import { ShoppingBag } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'
import { StatusBadge } from '../ui/StatusBadge'
import { getOrderStatusTone, getPaymentStatusTone, getShippingStatus } from '../../../utils/orderAdminUtils'

export function OrderStatusBadge({ status }) {
  return <StatusBadge tone={getOrderStatusTone(status)}>{status || 'Unknown'}</StatusBadge>
}

export function PaymentStatusBadge({ status }) {
  return <StatusBadge tone={getPaymentStatusTone(status)}>{status || 'Pending'}</StatusBadge>
}

export function ShippingStatusBadge({ order }) {
  const shipping = getShippingStatus(order)
  return <StatusBadge tone={shipping.tone}>{shipping.label}</StatusBadge>
}

export function OrderEmptyState({ hasFilters, onClear }) {
  if (hasFilters) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No search results"
        description="Try adjusting filters or search terms."
        action={
          <button type="button" className="ord-btn ord-btn--ghost" onClick={onClear}>
            Clear filters
          </button>
        }
      />
    )
  }

  return (
    <EmptyState
      icon={ShoppingBag}
      title="No orders yet"
      description="Orders will appear here once customers complete checkout."
    />
  )
}
