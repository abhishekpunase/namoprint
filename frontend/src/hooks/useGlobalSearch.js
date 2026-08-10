import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { buildSearchIndex, searchIndex } from '../utils/systemAdminUtils'

export function useGlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [helpOpen, setHelpOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [a11yOpen, setA11yOpen] = useState(false)

  const loadIndex = useCallback(async () => {
    setLoading(true)
    try {
      const [ordersPayload, productsPayload, usersPayload, categoriesPayload, couponsPayload] = await Promise.all([
        api.adminOrders(),
        api.adminProducts('?limit=40'),
        api.adminUsers('?limit=40'),
        api.adminCategories(),
        api.coupons(),
      ])
      setIndex(
        buildSearchIndex({
          orders: (ordersPayload.orders || []).slice(0, 30),
          products: productsPayload.products || productsPayload || [],
          users: usersPayload.users || [],
          categories: categoriesPayload.categories || categoriesPayload || [],
          coupons: Array.isArray(couponsPayload) ? couponsPayload : couponsPayload.coupons || [],
        }),
      )
    } catch {
      setIndex(buildSearchIndex({}))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open && !index.length) loadIndex()
  }, [open, index.length, loadIndex])

  const results = useMemo(() => searchIndex(query, index, 15), [query, index])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  const openPalette = useCallback(() => {
    setOpen(true)
    setQuery('')
  }, [])

  const closePalette = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  return {
    open,
    setOpen,
    openPalette,
    closePalette,
    query,
    setQuery,
    results,
    loading,
    activeIndex,
    setActiveIndex,
    reload: loadIndex,
    helpOpen,
    setHelpOpen,
    shortcutsOpen,
    setShortcutsOpen,
    a11yOpen,
    setA11yOpen,
  }
}

export function useKeyboardShortcuts(handlers = {}) {
  useEffect(() => {
    const onKeyDown = (event) => {
      const mod = event.metaKey || event.ctrlKey

      if (mod && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        handlers.onCommandPalette?.()
        return
      }

      if (mod && event.key.toLowerCase() === '/') {
        event.preventDefault()
        handlers.onShowShortcuts?.()
        return
      }

      if (event.key === 'Escape') {
        handlers.onEscape?.()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlers])
}

export function useAccessibility() {
  const [prefs, setPrefsState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('omgs_a11y_preferences') || '{}')
    } catch {
      return {}
    }
  })

  const apply = useCallback((next) => {
    const shell = document.querySelector('.admin-v2-shell')
    if (shell) {
      shell.dataset.reducedMotion = next.reducedMotion ? 'true' : 'false'
      shell.dataset.highContrast = next.highContrast ? 'true' : 'false'
      shell.style.fontSize = next.fontScale ? `${next.fontScale}%` : ''
    }
    document.documentElement.style.setProperty('--admin-focus-ring', next.focusVisible ? '2px solid var(--admin-primary)' : 'none')
  }, [])

  useEffect(() => {
    apply({
      reducedMotion: prefs.reducedMotion ?? false,
      highContrast: prefs.highContrast ?? false,
      focusVisible: prefs.focusVisible ?? true,
      fontScale: prefs.fontScale ?? 100,
    })
  }, [prefs, apply])

  const setPrefs = useCallback((patch) => {
    setPrefsState((current) => {
      const next = { ...current, ...patch }
      localStorage.setItem('omgs_a11y_preferences', JSON.stringify(next))
      return next
    })
  }, [])

  return { prefs, setPrefs }
}
