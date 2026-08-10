import { apiRequest } from './api'
import { createStorefrontList } from '../utils/fetchAllProducts'

export const corporateGiftApi = {
  list: createStorefrontList(apiRequest, '/corporate-gifts'),
  get: (slug) => apiRequest(`/corporate-gifts/${slug}`),

  adminList: () => apiRequest('/corporate-gifts/admin/all'),
  adminCreate: (payload) => apiRequest('/corporate-gifts/admin/create', { method: 'POST', body: payload }),
  adminUpdate: (id, payload) => apiRequest(`/corporate-gifts/admin/${id}`, { method: 'PATCH', body: payload }),
  adminDelete: (id) => apiRequest(`/corporate-gifts/admin/${id}`, { method: 'DELETE' }),
}
