import { apiRequest } from './api'
import { createStorefrontList } from '../utils/fetchAllProducts'

export const tShirtApi = {
  list: createStorefrontList(apiRequest, '/tshirt-printing'),
  get: (slug) => apiRequest(`/tshirt-printing/${slug}`),

  adminList: () => apiRequest('/tshirt-printing/admin/all'),
  adminCreate: (payload) => apiRequest('/tshirt-printing/admin/create', { method: 'POST', body: payload }),
  adminUpdate: (id, payload) => apiRequest(`/tshirt-printing/admin/${id}`, { method: 'PATCH', body: payload }),
  adminDelete: (id) => apiRequest(`/tshirt-printing/admin/${id}`, { method: 'DELETE' }),
}
