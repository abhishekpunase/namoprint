import { useCallback, useMemo, useState } from 'react'
import { AdminToastContext } from './AdminToastContextBase'
import { ToastContainer } from '../components/admin/ui/Toast'

let toastId = 0

export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback((toast) => {
    const id = ++toastId
    setToasts((current) => [...current, { id, ...toast }])
    const duration = toast.duration ?? 4000
    if (duration > 0) {
      window.setTimeout(() => dismiss(id), duration)
    }
    return id
  }, [dismiss])

  const value = useMemo(
    () => ({
      toasts,
      push,
      dismiss,
      success: (message, options = {}) => push({ type: 'success', message, ...options }),
      error: (message, options = {}) => push({ type: 'error', message, ...options }),
      info: (message, options = {}) => push({ type: 'info', message, ...options }),
    }),
    [toasts, push, dismiss],
  )

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </AdminToastContext.Provider>
  )
}
