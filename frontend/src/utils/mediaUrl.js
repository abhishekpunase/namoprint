import { getApiOrigin } from '../config/apiConfig'

const LOCALHOST_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i

/** Paths served by the Vite frontend (public/) — must not be prefixed with the API origin. */
const FRONTEND_STATIC_PREFIXES = ['/mockups/', '/products/', '/assets/', '/icons', '/favicon']

/** Old /mockups/* paths → actual files under /products/mockups/ */
const LEGACY_MOCKUP_RE = /^\/mockups\/(.+)$/i

function rewriteLocalhostUrl(url) {
  if (!LOCALHOST_ORIGIN_RE.test(url)) return url
  const pathPart = url.replace(LOCALHOST_ORIGIN_RE, '')
  const path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`
  return resolveMediaUrl(path)
}

/** True when a URL looks like an image/media asset (not an API/HTML route). */
export function isLikelyMediaUrl(url) {
  if (!url || typeof url !== 'string') return false
  const value = url.trim()
  if (!value) return false
  if (/^data:image\//i.test(value) || /^blob:/i.test(value)) return true
  if (/^https?:\/\//i.test(value)) {
    try {
      const { pathname } = new URL(value)
      if (/\/api\//i.test(pathname)) return false
      return true
    } catch {
      return false
    }
  }
  if (value.startsWith('/api/')) return false
  if (FRONTEND_STATIC_PREFIXES.some((prefix) => value.startsWith(prefix))) return true
  if (value.startsWith('/uploads/')) return true
  return /\.(svg|png|jpe?g|webp|gif|avif)(\?|$)/i.test(value)
}

/** Normalize relative or localhost upload paths for <img src>. */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (/^https?:\/\//i.test(trimmed)) return rewriteLocalhostUrl(trimmed)
  if (trimmed.startsWith('//')) return `https:${trimmed}`

  let path = trimmed.startsWith('/') ? trimmed : `/${trimmed.replace(/^\/+/, '')}`

  const legacy = path.match(LEGACY_MOCKUP_RE)
  if (legacy) {
    path = `/products/mockups/${legacy[1]}`
  }

  if (!isLikelyMediaUrl(path) && path.startsWith('/api/')) {
    return ''
  }

  if (FRONTEND_STATIC_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return path
  }

  const origin = getApiOrigin()
  return origin ? `${origin}${path}` : path
}

export function resolveProductImage(product, index = 0) {
  const raw = product?.images?.[index] || product?.images?.[0] || product?.mockup?.baseImageUrl || ''
  return resolveMediaUrl(raw)
}
