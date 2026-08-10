import { apiRequest } from './api'
import { createStorefrontList } from '../utils/fetchAllProducts'

export const penPrintApi = {
  list: createStorefrontList(apiRequest, '/pen-prints'),
  get: (slug) => apiRequest(`/pen-prints/${slug}`),

  adminList: () => apiRequest('/pen-prints/admin/all'),
  adminCreate: (payload) => apiRequest('/pen-prints/admin/create', { method: 'POST', body: payload }),
  adminUpdate: (id, payload) => apiRequest(`/pen-prints/admin/${id}`, { method: 'PATCH', body: payload }),
  adminDelete: (id) => apiRequest(`/pen-prints/admin/${id}`, { method: 'DELETE' }),
}
