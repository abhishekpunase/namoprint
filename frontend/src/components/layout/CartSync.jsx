import { useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'

export function CartSync() {
  const { isAuthenticated } = useAuth()
  const { syncToServer } = useCart()
  const syncedForAuth = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      syncedForAuth.current = false
      return
    }
    if (syncedForAuth.current) return
    syncedForAuth.current = true
    syncToServer().catch(() => {})
  }, [isAuthenticated, syncToServer])

  return null
}
