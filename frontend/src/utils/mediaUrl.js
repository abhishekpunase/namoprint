import { getApiOrigin } from '../config/apiConfig'

const API_ORIGIN = getApiOrigin()
const LOCALHOST_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i

/** Paths served by the Vite frontend (public/) — must not be prefixed with the API origin. */
const FRONTEND_STATIC_PREFIXES = ['/mockups/', '/products/', '/assets/']

function rewriteLocalhostUrl(url) {
  if (!LOCALHOST_ORIGIN_RE.test(url)) return url
  const pathPart = url.replace(LOCALHOST_ORIGIN_RE, '')
  return `${API_ORIGIN}${pathPart.startsWith('/') ? pathPart : `/${pathPart}`}`
}

/** Normalize relative or localhost upload paths for <img src>. */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return rewriteLocalhostUrl(trimmed)
  if (trimmed.startsWith('//')) return `https:${trimmed}`
  if (trimmed.startsWith('/')) {
    if (FRONTEND_STATIC_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
      return trimmed
    }
    return `${API_ORIGIN}${trimmed}`
  }
  return `${API_ORIGIN}/${trimmed.replace(/^\/+/, '')}`
}

export function resolveProductImage(product, index = 0) {
  const raw = product?.images?.[index] || product?.images?.[0] || product?.mockup?.baseImageUrl || ''
  return resolveMediaUrl(raw)
}
