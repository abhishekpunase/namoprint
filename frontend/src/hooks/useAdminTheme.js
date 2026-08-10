import { useContext } from 'react'
import { AdminThemeContext } from '../context/AdminThemeContextBase'

export function useAdminTheme() {
  const value = useContext(AdminThemeContext)
  if (!value) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider')
  }
  return value
}
