import { resolveMediaUrl } from './mediaUrl'
import { getApiBaseUrl } from '../config/apiConfig'

const API_BASE = getApiBaseUrl()

export function isTShirtLineItem(item) {
  return item?.itemType === 'tshirt' || item?.customization?.itemType === 'tshirt' || item?.tShirtProduct
}

export function getTShirtProductImageUrl(item) {
  const c = item?.customization || {}
  if (c.productImageUrl) return resolveMediaUrl(c.productImageUrl)

  const tShirtProduct = typeof item?.tShirtProduct === 'object' ? item.tShirtProduct : null
  if (tShirtProduct?.images?.[0]) return resolveMediaUrl(tShirtProduct.images[0])

  return ''
}

export function getTShirtLogoUrl(item) {
  const c = item?.customization || {}
  if (c.logoUrl) return resolveMediaUrl(c.logoUrl)
  if (c.previewUrl && c.previewUrl !== c.productImageUrl) return resolveMediaUrl(c.previewUrl)
  return ''
}

export async function downloadTShirtAsset({ orderId, itemId, assetType, orderNo = 'order', sku = 'tshirt' }) {
  const token = localStorage.getItem('omgs_access_token')
  const response = await fetch(
    `${API_BASE}/admin/orders/${orderId}/items/${itemId}/asset/${assetType}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  )
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || 'Download failed')
  }
  const blob = await response.blob()
  const ext = assetType === 'logo' ? 'logo' : 'product'
  const safeName = `${orderNo}-${sku}-${ext}`.replace(/[^\w.-]+/g, '-')
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = safeName.includes('.') ? safeName : `${safeName}.jpg`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function downloadPublicImage(url, filename = 'image.jpg') {
  const resolved = resolveMediaUrl(url)
  if (!resolved) throw new Error('Image URL missing')
  const response = await fetch(resolved)
  if (!response.ok) throw new Error('Could not download image')
  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename.replace(/[^\w.-]+/g, '-')
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(blobUrl)
}
