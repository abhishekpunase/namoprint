import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Copy,
  ExternalLink,
  Printer,
  RefreshCw,
  RotateCcw,
  Tag,
  Truck,
  XCircle,
} from 'lucide-react'
import { useOrderDetail } from '../../../hooks/useOrderDetail'
import { OrderStatusBadge } from './OrderStatusBadge'
import { OrderSummaryCard } from './OrderSummaryCard'
import { OrderCustomerCard } from './OrderCustomerCard'
import { OrderProductsTable } from './OrderProductsTable'
import { OrderPaymentCard, OrderShippingCard, OrderAddressCards } from './OrderPaymentShipping'
import { OrderTimeline, OrderNotesPanel, OrderInvoicePanel } from './OrderTimeline'
import { StatusUpdateModal, RefundModal } from './OrderToolbar'
import { Skeleton } from '../ui/Loader'

export function OrderDetailView({ orderId }) {
  const detail = useOrderDetail(orderId)
  const [statusModal, setStatusModal] = useState(false)
  const [refundModal, setRefundModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')

  useEffect(() => {
    if (orderId) detail.load()
  }, [orderId])

  useEffect(() => {
    if (detail.order?.status) setNewStatus(detail.order.status)
  }, [detail.order?.status])

  const confirmStatus = async () => {
    await detail.updateStatus(newStatus, statusNote || `Status updated to ${newStatus}`)
    setStatusModal(false)
    setStatusNote('')
  }

  if (detail.loading) {
    return (
      <div className="ord-detail">
        <Skeleton className="ord-detail-skeleton" />
      </div>
    )
  }

  if (detail.error || !detail.order) {
    return (
      <div className="ord-detail">
        <div className="ord-alert ord-alert--error">
          {detail.error || 'Order not found'}
          <button type="button" className="ord-btn ord-btn--ghost" onClick={detail.load}>Retry</button>
        </div>
        <Link to="/admin/orders" className="ord-btn ord-btn--ghost">Back to orders</Link>
      </div>
    )
  }

  const order = detail.order

  return (
    <div className="ord-detail">
      <div className="ord-detail__head">
        <div>
          <nav className="ord-breadcrumb">
            <Link to="/admin/orders">Orders</Link> / <span>{order.orderNo}</span>
          </nav>
          <h1>{order.orderNo}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="ord-detail__actions ord-detail__actions--sticky">
          <button type="button" className="ord-btn ord-btn--primary" onClick={() => setStatusModal(true)}>
            <Tag size={16} /> Update Status
          </button>
          <button type="button" className="ord-btn ord-btn--ghost" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
          <button type="button" className="ord-btn ord-btn--ghost" disabled title="TODO: invoice PDF API">
            <ExternalLink size={16} /> Invoice (TODO)
          </button>
          <button type="button" className="ord-btn ord-btn--ghost" disabled title="TODO: duplicate order API">
            <Copy size={16} /> Duplicate (TODO)
          </button>
          <button type="button" className="ord-btn ord-btn--ghost" onClick={() => setRefundModal(true)}>
            <RotateCcw size={16} /> Refund
          </button>
          <button type="button" className="ord-btn ord-btn--ghost" onClick={detail.load}>
            <RefreshCw size={16} /> Refresh
          </button>
          {order.status !== 'Cancelled' && (
            <button
              type="button"
              className="ord-btn ord-btn--danger"
              onClick={() => {
                setNewStatus('Cancelled')
                setStatusNote('Order cancelled by admin')
                setStatusModal(true)
              }}
            >
              <XCircle size={16} /> Cancel
            </button>
          )}
        </div>
      </div>

      {detail.message && <div className="ord-alert ord-alert--success">{detail.message}</div>}
      {detail.error && <div className="ord-alert ord-alert--error">{detail.error}</div>}

      <div className="ord-detail__grid">
        <OrderSummaryCard order={order} />
        <OrderCustomerCard order={order} allOrders={detail.allOrders} />
      </div>

      <OrderAddressCards order={order} />

      <section className="ord-panel">
        <h2>Ordered Products</h2>
        <OrderProductsTable items={order.items} />
      </section>

      <div className="ord-detail__grid">
        <OrderPaymentCard order={order} />
        <OrderShippingCard order={order} />
      </div>

      <div className="ord-detail__grid">
        <section className="ord-panel">
          <h2><Truck size={18} /> Order Timeline</h2>
          <OrderTimeline order={order} />
        </section>
        <div className="ord-detail__stack">
          <OrderNotesPanel order={order} />
          <OrderInvoicePanel order={order} />
        </div>
      </div>

      <StatusUpdateModal
        open={statusModal}
        title="Update order status"
        statuses={detail.orderStatuses}
        value={newStatus}
        onChange={setNewStatus}
        note={statusNote}
        onNoteChange={setStatusNote}
        onClose={() => setStatusModal(false)}
        onConfirm={confirmStatus}
        saving={detail.updating}
      />

      <RefundModal open={refundModal} onClose={() => setRefundModal(false)} />
    </div>
  )
}
