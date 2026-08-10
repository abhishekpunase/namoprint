import { useState } from 'react'
import { Download, Eye, X } from 'lucide-react'
import { OrderStatusBadge } from './OrderStatusBadge'
import { CustomizationSummary } from '../../shared/CustomizationSummary'
import { TShirtPrintAssets } from '../../shared/TShirtPrintAssets'
import { formatCurrency } from '../../../utils/format'
import {
  formatOrderModalDate,
  getOrderItemDesignPreviewUrl,
  getOrderItemSizeLabel,
  getOrderPaymentMethodLabel,
} from '../../../utils/orderAdminUtils'
import { isTShirtLineItem } from '../../../utils/tShirtOrderAssets'
import { resolveMediaUrl } from '../../../utils/mediaUrl'
import { api } from '../../../services/api'

function formatAddressBlock(address) {
  if (!address) return '—'
  return [
    address.fullName,
    address.line1,
    address.line2,
    [address.city, address.state, address.pincode].filter(Boolean).join(', '),
    address.country,
    address.phone ? `Phone: ${address.phone}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

function DesignLightbox({ url, title, onClose }) {
  if (!url) return null
  return (
    <div className="ord-modal-root ord-design-lightbox" role="dialog" aria-modal="true">
      <button type="button" className="ord-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="ord-design-lightbox__panel">
        <div className="ord-design-lightbox__head">
          <strong>{title}</strong>
          <button type="button" className="ord-icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <img src={resolveMediaUrl(url)} alt={title} className="ord-design-lightbox__img" />
      </div>
    </div>
  )
}

export function OrderDetailsModal({ order, open, onClose }) {
  const [lightbox, setLightbox] = useState(null)
  const [downloadingId, setDownloadingId] = useState('')
  const [downloadError, setDownloadError] = useState('')

  if (!open || !order) return null

  const primaryItem = order.items?.[0]
  const paymentPending = order.payment?.status !== 'Paid'

  const handleDownload = async (item) => {
    if (!item?._id) return
    setDownloadError('')
    setDownloadingId(item._id)
    try {
      await api.adminDownloadOrderDesign(order._id, item._id, order.orderNo, item.sku)
    } catch (err) {
      setDownloadError(err.message || 'Download failed')
    } finally {
      setDownloadingId('')
    }
  }

  return (
    <>
      <div className="ord-modal-root ord-detail-modal-root" role="dialog" aria-modal="true" aria-labelledby="ord-detail-title">
        <button type="button" className="ord-modal-backdrop" aria-label="Close" onClick={onClose} />
        <div className="ord-detail-modal">
          <div className="ord-detail-modal__head">
            <h2 id="ord-detail-title">Order Details - {order.orderNo}</h2>
            <button type="button" className="ord-icon-btn" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <div className="ord-detail-modal__section ord-detail-modal__section--muted">
            <div className="ord-detail-modal__grid2">
              <div>
                <span className="ord-detail-modal__label">Customer Name</span>
                <strong>{order.customer?.name || 'Guest'}</strong>
              </div>
              <div>
                <span className="ord-detail-modal__label">Email</span>
                <strong>{order.customer?.email || 'Guest'}</strong>
              </div>
              <div>
                <span className="ord-detail-modal__label">Order ID</span>
                <strong>{order.orderNo}</strong>
              </div>
              <div>
                <span className="ord-detail-modal__label">Date</span>
                <strong>{formatOrderModalDate(order.createdAt)}</strong>
              </div>
            </div>
          </div>

          <div className="ord-detail-modal__section ord-detail-modal__section--muted">
            <span className="ord-detail-modal__label">Shipping Address</span>
            <pre className="ord-detail-modal__address">{formatAddressBlock(order.shippingAddress)}</pre>
          </div>

          <div className="ord-detail-modal__section">
            <h3>Order Items</h3>
            {(order.items || []).map((item) => {
              const itemDesignUrl = getOrderItemDesignPreviewUrl(item)
              const sizeLabel = getOrderItemSizeLabel(item)
              return (
                <div key={item._id || item.sku} className="ord-detail-modal__item">
                  <div className="ord-detail-modal__item-head">
                    <div>
                      <strong>{item.title}</strong>
                      {item.variantSnapshot?.material ? (
                        <span className="ord-detail-modal__tag">{item.variantSnapshot.material}</span>
                      ) : null}
                    </div>
                    <strong>{formatCurrency((item.unitPrice || 0) * (item.quantity || 1))}</strong>
                  </div>
                  <p className="ord-detail-modal__meta">
                    {sizeLabel}
                    {sizeLabel ? ' · ' : ''}
                    Qty: {item.quantity || 1}
                  </p>

                  <CustomizationSummary
                    customization={item.customization}
                    item={item}
                    variant="admin"
                    showPreview={false}
                    showTitle={false}
                    className="ord-detail-modal__customization"
                  />

                  {isTShirtLineItem(item) ? (
                    <div className="ord-detail-modal__design">
                      <span className="ord-detail-modal__label">Print files</span>
                      <TShirtPrintAssets
                        item={item}
                        orderId={order._id}
                        orderNo={order.orderNo}
                        variant="admin"
                        onPreview={setLightbox}
                      />
                    </div>
                  ) : (
                  <div className="ord-detail-modal__design">
                    <span className="ord-detail-modal__label">Uploaded Design:</span>
                    <div className="ord-detail-modal__design-row">
                      {itemDesignUrl ? (
                        <button
                          type="button"
                          className="ord-detail-modal__thumb-btn"
                          onClick={() => setLightbox({ url: itemDesignUrl, title: item.title })}
                        >
                          <img src={resolveMediaUrl(itemDesignUrl)} alt="" />
                        </button>
                      ) : (
                        <div className="ord-detail-modal__thumb-empty">No preview saved</div>
                      )}
                      <div className="ord-detail-modal__design-actions">
                        <button
                          type="button"
                          className="ord-btn ord-btn--ghost ord-btn--view-design"
                          disabled={!itemDesignUrl}
                          onClick={() => setLightbox({ url: itemDesignUrl, title: item.title })}
                        >
                          <Eye size={16} /> View
                        </button>
                        <button
                          type="button"
                          className="ord-btn ord-btn--primary"
                          disabled={!item._id || downloadingId === item._id}
                          onClick={() => handleDownload(item)}
                        >
                          <Download size={16} />
                          {downloadingId === item._id ? 'Preparing…' : 'Download'}
                        </button>
                      </div>
                    </div>
                    <small className="ord-detail-modal__hint">JPEG export at 300 DPI for print production</small>
                  </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="ord-detail-modal__section ord-detail-modal__section--muted">
            <h3>Payment Information</h3>
            <div className="ord-detail-modal__grid2">
              <div>
                <span className="ord-detail-modal__label">Payment Method</span>
                <strong>{getOrderPaymentMethodLabel(order)}</strong>
              </div>
              <div>
                <span className="ord-detail-modal__label">Payment Status</span>
                <span className={`ord-pay-badge ${paymentPending ? 'is-pending' : 'is-paid'}`}>
                  {order.payment?.status || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {downloadError ? <div className="ord-alert ord-alert--error">{downloadError}</div> : null}

          <div className="ord-detail-modal__footer">
            <div>
              <span className="ord-detail-modal__label">Total Amount</span>
              <strong className="ord-detail-modal__total">{formatCurrency(order.totals?.total || 0)}</strong>
            </div>
            <div className="ord-detail-modal__footer-status">
              <span className="ord-detail-modal__label">Status</span>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </div>
      </div>

      {lightbox ? (
        <DesignLightbox url={lightbox.url} title={lightbox.title} onClose={() => setLightbox(null)} />
      ) : null}
    </>
  )
}
