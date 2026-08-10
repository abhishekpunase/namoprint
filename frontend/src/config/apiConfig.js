function normalizeApiBase(raw) {
  if (!raw || typeof raw !== 'string') return ''
  const trimmed = raw.trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}

/** Resolve API base URL for dev (Vite proxy), production (same-origin), or explicit env. */
export function getApiBaseUrl() {
  const fromEnv = normalizeApiBase(import.meta.env.VITE_API_BASE_URL)
  if (fromEnv) return fromEnv

  // Same-origin /api — works with Vite dev proxy and production reverse proxy / static serve.
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
    return 'API server is not running. From the project root run: npm run dev — then open http://localhost:5173'
  }

  const base = getApiBaseUrl()
  if (base.startsWith('http')) {
    return `Cannot reach API at ${base}. Check server status or contact support.`
  }
  return 'Cannot reach API server. Please try again in a moment or contact support.'
}
