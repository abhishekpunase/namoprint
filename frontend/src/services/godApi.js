import { apiRequest } from './api'
import { createStorefrontList } from '../utils/fetchAllProducts'

export const godApi = {
  list: createStorefrontList(apiRequest, '/god-products'),
  get: (slug) => apiRequest(`/god-products/${slug}`),
  placeOrder: (payload) => apiRequest('/god-products/orders', { method: 'POST', body: payload }),

  adminList: () => apiRequest('/god-products/admin/all'),
  adminCreate: (payload) => apiRequest('/god-products/admin/create', { method: 'POST', body: payload }),
  adminUpdate: (id, payload) => apiRequest(`/god-products/admin/${id}`, { method: 'PATCH', body: payload }),
  adminDelete: (id) => apiRequest(`/god-products/admin/${id}`, { method: 'DELETE' }),

  adminOrders: () => apiRequest('/god-products/admin/orders/all'),
  adminUpdateOrderStatus: (id, payload) =>
    apiRequest(`/god-products/admin/orders/${id}/status`, { method: 'PATCH', body: payload }),
}
