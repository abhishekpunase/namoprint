import { apiRequest } from './api'
import { createStorefrontList } from '../utils/fetchAllProducts'

export const namePlateApi = {
  list: createStorefrontList(apiRequest, '/nameplates'),
  get: (slug) => apiRequest(`/nameplates/${slug}`),
  placeOrder: (payload) => apiRequest('/nameplates/orders', { method: 'POST', body: payload }),

  adminList: () => apiRequest('/nameplates/admin/all'),
  adminCreate: (payload) => apiRequest('/nameplates/admin/create', { method: 'POST', body: payload }),
  adminUpdate: (id, payload) => apiRequest(`/nameplates/admin/${id}`, { method: 'PATCH', body: payload }),
  adminDelete: (id) => apiRequest(`/nameplates/admin/${id}`, { method: 'DELETE' }),

  adminOrders: () => apiRequest('/nameplates/admin/orders/all'),
  adminUpdateOrderStatus: (id, payload) =>
    apiRequest(`/nameplates/admin/orders/${id}/status`, { method: 'PATCH', body: payload }),
}
