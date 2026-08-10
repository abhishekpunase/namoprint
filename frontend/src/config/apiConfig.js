function normalizeApiBase(raw) {
  if (!raw || typeof raw !== 'string') return ''
  const trimmed = raw.trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}

/** Dev: /api via Vite proxy. Prod: same-origin /api or explicit VITE_API_BASE_URL. */
export function getApiBaseUrl() {
  const fromEnv = normalizeApiBase(import.meta.env.VITE_API_BASE_URL)
  if (fromEnv) {
    if (import.meta.env.DEV && /^https?:\/\//i.test(fromEnv)) {
      console.warn(
        '[api] VITE_API_BASE_URL is set to an absolute URL in dev — Vite proxy is bypassed.',
        'Remove it from frontend/.env to use VITE_DEV_API_TARGET via /api proxy.',
      )
    }
    return fromEnv
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
    return 'API server is not running. From the project root run: npm run dev'
  }
  return 'Cannot reach API server. Please try again in a moment.'
}
