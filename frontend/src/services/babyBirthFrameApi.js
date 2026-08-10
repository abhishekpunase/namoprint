import { apiRequest } from './api'
import { createStorefrontList } from '../utils/fetchAllProducts'

export const babyBirthFrameApi = {
  list: createStorefrontList(apiRequest, '/baby-birth-frames'),
  get: (slug) => apiRequest(`/baby-birth-frames/${slug}`),

  adminList: () => apiRequest('/baby-birth-frames/admin/all'),
  adminCreate: (payload) => apiRequest('/baby-birth-frames/admin/create', { method: 'POST', body: payload }),
  adminUpdate: (id, payload) => apiRequest(`/baby-birth-frames/admin/${id}`, { method: 'PATCH', body: payload }),
  adminDelete: (id) => apiRequest(`/baby-birth-frames/admin/${id}`, { method: 'DELETE' }),
}
