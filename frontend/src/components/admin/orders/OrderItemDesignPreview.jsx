import { useEffect, useMemo, useState } from 'react'
import { PreviewFrame } from '../../product/PreviewFrame'
import { enrichProductMockup } from '../../../utils/enrichProductMockup'
import { resolveMediaUrl } from '../../../utils/mediaUrl'
import { getOrderItemDesignPreviewUrl } from '../../../utils/orderAdminUtils'

function normalizeSlotPhotos(slotPhotos = []) {
  if (!Array.isArray(slotPhotos) || !slotPhotos.length) return []
  const byIndex = []
  slotPhotos.forEach((entry, index) => {
    if (!entry) return
    const placementMatch = String(entry.placement || '').match(/slot-(\d+)/i)
    const idx = placementMatch ? Number(placementMatch[1]) - 1 : index
    if (idx < 0) return
    const url = resolveMediaUrl(entry.url || entry.previewUrl || entry.optimizedUrl || '')
    if (!url) return
    byIndex[idx] = {
      ...entry,
      url,
      crop: entry.crop || { x: 0, y: 0, scale: 1, rotate: 0 },
    }
  })
  return byIndex
}

/**
 * Admin order design preview using the same PreviewFrame as the customer designer,
 * so crop / cover / slots match what the user fixed.
 */
export function OrderItemDesignPreview({ item, onOpenLightbox }) {
  const [product, setProduct] = useState(null)
  const fallbackUrl = getOrderItemDesignPreviewUrl(item)
  const customization = item?.customization || {}
  const slotPhotos = useMemo(
    () => normalizeSlotPhotos(customization.slotPhotos || []),
    [customization.slotPhotos],
  )

  useEffect(() => {
    let cancelled = false
    const base = typeof item?.product === 'object' ? item.product : null
    if (!base) {
      setProduct(null)
      return undefined
    }
    enrichProductMockup(base)
      .then((enriched) => {
        if (!cancelled) setProduct(enriched)
      })
      .catch(() => {
        if (!cancelled) setProduct(base)
      })
    return () => {
      cancelled = true
    }
  }, [item?.product])

  const hasLiveSlots = Boolean(
    (product?.mockup?.frameImage || product?.mockup?.photoBoxes?.length) &&
      slotPhotos.some((slot) => slot?.url),
  )

  const options = customization.options || {}
  const variant =
    item.variantSnapshot ||
    product?.variants?.find((v) => String(v._id) === String(item.variantId)) ||
    product?.variants?.[0]

  if (hasLiveSlots && product) {
    return (
      <div className="ord-detail-modal__live-preview">
        <PreviewFrame
          product={product}
          variant={variant}
          options={options}
          slotPhotos={slotPhotos}
          crop={slotPhotos[0]?.crop}
          text={customization.text || {}}
          compact
        />
        {fallbackUrl ? (
          <button
            type="button"
            className="ord-btn ord-btn--ghost ord-detail-modal__live-expand"
            onClick={() => onOpenLightbox?.({ url: fallbackUrl, title: item.title })}
          >
            Expand saved export
          </button>
        ) : null}
      </div>
    )
  }

  if (fallbackUrl) {
    return (
      <button
        type="button"
        className="ord-detail-modal__thumb-btn"
        onClick={() => onOpenLightbox?.({ url: fallbackUrl, title: item.title })}
      >
        <img src={resolveMediaUrl(fallbackUrl)} alt="" />
      </button>
    )
  }

  return <div className="ord-detail-modal__thumb-empty">No preview saved</div>
}
