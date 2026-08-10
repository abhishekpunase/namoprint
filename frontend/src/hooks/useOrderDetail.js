import { useCallback, useState } from 'react'
import { api } from '../services/api'
import { ORDER_STATUSES } from '../utils/orderAdminUtils'

export function useOrderDetail(orderId) {
  const [order, setOrder] = useState(null)
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [updating, setUpdating] = useState(false)

  const load = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    setError('')
    try {
      const [orderPayload, listPayload] = await Promise.all([
        api.adminOrder(orderId),
        api.adminOrders(),
      ])
      setOrder(orderPayload.order)
      setAllOrders(listPayload.orders || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  const updateStatus = async (status, note) => {
    setUpdating(true)
    setMessage('')
    setError('')
    try {
      const payload = await api.adminUpdateOrderStatus(orderId, { status, note })
      setOrder(payload.order)
      setMessage('Order status updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  return {
    order,
    allOrders,
    loading,
    error,
    message,
    updating,
    load,
    updateStatus,
    orderStatuses: ORDER_STATUSES,
  }
}
