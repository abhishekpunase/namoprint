import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAdminTheme } from './useAdminTheme'

const APPEARANCE_KEY = 'omgs_admin_appearance'

const readAppearance = () => {
  try {
    return JSON.parse(localStorage.getItem(APPEARANCE_KEY)) || {}
  } catch {
    return {}
  }
}

export function useThemeSettings() {
  const { theme, setTheme, toggleTheme } = useAdminTheme()
  const [appearance, setAppearance] = useState(readAppearance)

  const saveAppearance = useCallback((patch) => {
    setAppearance((current) => {
      const next = { ...current, ...patch }
      localStorage.setItem(APPEARANCE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (appearance.primaryColor) root.style.setProperty('--admin-primary', appearance.primaryColor)
    if (appearance.accentColor) root.style.setProperty('--admin-primary-strong', appearance.accentColor)
  }, [appearance])

  return useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      appearance,
      saveAppearance,
    }),
    [theme, setTheme, toggleTheme, appearance, saveAppearance],
  )
}
