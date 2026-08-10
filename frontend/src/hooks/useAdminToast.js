import { useContext } from 'react'
import { AdminToastContext } from '../context/AdminToastContextBase'

export function useAdminToast() {
  const value = useContext(AdminToastContext)
  if (!value) {
    throw new Error('useAdminToast must be used within AdminToastProvider')
  }
  return value
}
