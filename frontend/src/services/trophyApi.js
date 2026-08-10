import { apiRequest } from './api'
import { createStorefrontList } from '../utils/fetchAllProducts'

export const trophyApi = {
  list: createStorefrontList(apiRequest, '/trophies'),
  get: (slug) => apiRequest(`/trophies/${slug}`),

  adminList: () => apiRequest('/trophies/admin/all'),
  adminCreate: (payload) => apiRequest('/trophies/admin/create', { method: 'POST', body: payload }),
  adminUpdate: (id, payload) => apiRequest(`/trophies/admin/${id}`, { method: 'PATCH', body: payload }),
  adminDelete: (id) => apiRequest(`/trophies/admin/${id}`, { method: 'DELETE' }),
}
