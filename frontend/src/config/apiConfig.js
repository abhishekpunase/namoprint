function normalizeApiBase(raw) {
  if (!raw || typeof raw !== 'string') return ''
  const trimmed = raw.trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}

function getDevApiTarget() {
  return String(import.meta.env.VITE_DEV_API_TARGET || 'http://localhost:5000')
    .trim()
    .replace(/\/+$/, '')
}

/**
 * Dev API routing:
 * - VITE_DEV_API_MODE=direct (default): browser calls http://localhost:5000/api (Network tab shows port 5000)
 * - VITE_DEV_API_MODE=proxy: browser calls /api on Vite port; Vite proxies using VITE_DEV_API_TARGET
 */
export function getApiBaseUrl() {
  const explicit = normalizeApiBase(import.meta.env.VITE_API_BASE_URL)
  if (explicit) return explicit

  if (import.meta.env.DEV) {
    const mode = String(import.meta.env.VITE_DEV_API_MODE || 'direct').toLowerCase()
    if (mode === 'direct') {
      return `${getDevApiTarget()}/api`
    }
  }

  return '/api'
}

export function getApiOrigin() {
  const base = getApiBaseUrl()
  if (base.startsWith('http')) {
    try {
      return new URL(base).origin
    } catch {
      return base.replace(/\/api\/?$/, '')
    }
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

export function getNetworkErrorMessage() {
  if (import.meta.env.DEV) {
    const target = getDevApiTarget()
    return `Cannot reach API at ${target}. From the project root run: npm run dev`
  }
  return 'Cannot reach API server. Please try again in a moment.'
}
