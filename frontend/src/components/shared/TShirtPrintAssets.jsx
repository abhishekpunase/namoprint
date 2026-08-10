import { useState } from 'react'
import { FiDownload, FiEye } from 'react-icons/fi'
import {
  downloadPublicImage,
  downloadTShirtAsset,
  getTShirtLogoUrl,
  getTShirtProductImageUrl,
  isTShirtLineItem,
} from '../../utils/tShirtOrderAssets'

function AssetCard({ label, url, onView, onDownload, downloading, compact }) {
  return (
    <div className={`tshirt-asset-card ${compact ? 'tshirt-asset-card--compact' : ''}`.trim()}>
      <span className="tshirt-asset-card__label">{label}</span>
      <div className="tshirt-asset-card__frame">
        {url ? (
          <button type="button" className="tshirt-asset-card__thumb" onClick={onView} aria-label={`View ${label}`}>
            <img src={url} alt="" />
          </button>
        ) : (
          <div className="tshirt-asset-card__empty">Not uploaded</div>
        )}
      </div>
      {!compact && (
        <div className="tshirt-asset-card__actions">
          <button type="button" className="tshirt-asset-card__btn" disabled={!url} onClick={onView}>
            <FiEye size={14} /> View
          </button>
          <button
            type="button"
            className="tshirt-asset-card__btn tshirt-asset-card__btn--primary"
            disabled={!url || downloading}
            onClick={onDownload}
          >
            <FiDownload size={14} /> {downloading ? '…' : 'Download'}
          </button>
        </div>
      )}
    </div>
  )
}

export function TShirtPrintAssets({
  item,
  orderId,
  orderNo,
  variant = 'admin',
  onPreview,
  className = '',
}) {
  const [downloading, setDownloading] = useState('')

  if (!isTShirtLineItem(item)) return null

  const productUrl = getTShirtProductImageUrl(item)
  const logoUrl = getTShirtLogoUrl(item)
  const compact = variant === 'cart'

  const handleDownload = async (assetType, url, label) => {
    setDownloading(assetType)
    try {
      if (orderId && item._id) {
        await downloadTShirtAsset({
          orderId,
          itemId: item._id,
          assetType,
          orderNo,
          sku: item.sku || 'tshirt',
        })
      } else if (url) {
        await downloadPublicImage(url, `${label.replace(/\s+/g, '-').toLowerCase()}.jpg`)
      }
    } finally {
      setDownloading('')
    }
  }

  return (
    <div className={`tshirt-print-assets tshirt-print-assets--${variant} ${className}`.trim()}>
      {!compact && <p className="tshirt-print-assets__hint">T-shirt base + customer logo for printing</p>}
      <div className="tshirt-print-assets__grid">
        <AssetCard
          label="T-shirt product"
          url={productUrl}
          compact={compact}
          downloading={downloading === 'product'}
          onView={() => productUrl && onPreview?.({ url: productUrl, title: 'T-shirt product' })}
          onDownload={() => handleDownload('product', productUrl, 'tshirt-product')}
        />
        <AssetCard
          label="Customer logo"
          url={logoUrl}
          compact={compact}
          downloading={downloading === 'logo'}
          onView={() => logoUrl && onPreview?.({ url: logoUrl, title: 'Customer logo' })}
          onDownload={() => handleDownload('logo', logoUrl, 'customer-logo')}
        />
      </div>
    </div>
  )
}
