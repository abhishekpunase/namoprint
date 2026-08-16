import { composeDesignPreview } from './composeDesignPreview'
import { enrichProductMockup } from './enrichProductMockup'
import { resolveMediaUrl } from './mediaUrl'
import { api } from '../services/api'

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

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * Download the same collage the admin live preview shows (compose from product mockup + slot crops).
 * Falls back to server export if live data is incomplete.
 */
export async function downloadOrderItemDesignFile(order, item) {
  if (!order?._id || !item?._id) throw new Error('Order item missing')

  const safeName = `${order.orderNo || 'order'}-${item.sku || 'design'}.jpg`.replace(/[^\w.-]+/g, '-')
  const customization = item.customization || {}
  const slotPhotos = normalizeSlotPhotos(customization.slotPhotos || [])
  const productBase = typeof item.product === 'object' ? item.product : null

  if (productBase && slotPhotos.some((slot) => slot?.url)) {
    try {
      const product = await enrichProductMockup(productBase)
      const variant =
        item.variantSnapshot ||
        product?.variants?.find((v) => String(v._id) === String(item.variantId)) ||
        product?.variants?.[0]

      const { blob } = await composeDesignPreview({
        product,
        variant,
        options: customization.options || {},
        slotPhotos,
        design: {
          crop: slotPhotos[0]?.crop || customization.photos?.[0]?.crop,
          photoUrl: slotPhotos[0]?.url,
        },
        photoUrl: slotPhotos.find((slot) => slot?.url)?.url,
        frameColor: customization.frameColor,
        frameThicknessPx: Number.parseFloat(String(customization.thickness || '').replace(/[^\d.]/g, '')) || undefined,
        quality: 0.95,
        format: 'jpeg',
      })

      triggerBlobDownload(blob, safeName)
      return { source: 'live-compose' }
    } catch (err) {
      console.warn('Live design compose failed, falling back to server export', err)
    }
  }

  await api.adminDownloadOrderDesign(order._id, item._id, order.orderNo, item.sku)
  return { source: 'server' }
}
