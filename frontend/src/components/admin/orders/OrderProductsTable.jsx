import { formatCurrency } from '../../../utils/format'
import { CustomizationSummary } from '../../shared/CustomizationSummary'
import { TShirtPrintAssets } from '../../shared/TShirtPrintAssets'
import { OrderItemDesignPreview } from './OrderItemDesignPreview'
import { isTShirtLineItem } from '../../../utils/tShirtOrderAssets'

export function OrderProductsTable({ items = [] }) {
  if (!items.length) {
    return <p className="ord-subpanel__hint">No line items.</p>
  }

  return (
    <div className="ord-products-wrap">
      <table className="ord-products-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Variant</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const variant = item.variantSnapshot || {}
            const lineTotal = (item.unitPrice || 0) * (item.quantity || 0)
            return (
              <tr key={item._id || `${item.sku}-${item.title}`}>
                <td>
                  <strong>{item.title}</strong>
                  <small>{item.sku}</small>
                  {isTShirtLineItem(item) ? (
                    <TShirtPrintAssets item={item} variant="admin" className="ord-products-tshirt-assets" />
                  ) : (
                    <div className="ord-products-design-preview">
                      <OrderItemDesignPreview item={item} />
                    </div>
                  )}
                  <CustomizationSummary
                    customization={item.customization}
                    item={item}
                    variant="admin"
                    showPreview={false}
                  />
                  {item.productionFileUrl && (
                    <a href={item.productionFileUrl} target="_blank" rel="noreferrer" className="ord-production-link">
                      Production file
                    </a>
                  )}
                </td>
                <td>
                  {[variant.label, variant.size, variant.material, variant.frameType, item.customization?.qualityLabel]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unitPrice || 0)}</td>
                <td>{formatCurrency(lineTotal)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
