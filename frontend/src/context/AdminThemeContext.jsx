import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminThemeContext } from './AdminThemeContextBase'
import { useIsMobile, useMediaQuery } from '../hooks/useMediaQuery'

const STORAGE_KEY = 'omgs_admin_theme'
const SIDEBAR_KEY = 'omgs_admin_sidebar_collapsed'

const readTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const readCollapsed = () => {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'true'
  } catch {
    return false
  }
}

export function AdminThemeProvider({ children }) {
  const isMobile = useIsMobile()
  const isCompact = useMediaQuery('(max-width: 1023px)')
  const isDrawer = isCompact
  const [theme, setTheme] = useState(readTheme)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readCollapsed)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    if (!isDrawer) setMobileSidebarOpen(false)
  }, [isDrawer])

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileSidebarOpen])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const setThemeMode = useCallback((mode) => {
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
      localStorage.setItem(STORAGE_KEY, 'system')
      return
    }
    setTheme(mode === 'dark' ? 'dark' : 'light')
  }, [])

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((current) => !current)
  }, [])

  const openMobileSidebar = useCallback(() => setMobileSidebarOpen(true), [])
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), [])
  const toggleMobileSidebar = useCallback(() => setMobileSidebarOpen((current) => !current), [])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme: setThemeMode,
      sidebarCollapsed,
      toggleSidebarCollapsed,
      mobileSidebarOpen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,
      isMobile,
      isCompact,
      isDrawer,
    }),
    [
      theme,
      toggleTheme,
      setThemeMode,
      sidebarCollapsed,
      toggleSidebarCollapsed,
      mobileSidebarOpen,
      openMobileSidebar,
      closeMobileSidebar,
      toggleMobileSidebar,
      isMobile,
      isCompact,
      isDrawer,
    ],
  )

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>
}
