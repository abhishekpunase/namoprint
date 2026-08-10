import { apiRequest } from './api'
import { createStorefrontList } from '../utils/fetchAllProducts'

export const uvDtfStickerApi = {
  list: createStorefrontList(apiRequest, '/uv-dtf-stickers'),
  get: (slug) => apiRequest(`/uv-dtf-stickers/${slug}`),

  adminList: () => apiRequest('/uv-dtf-stickers/admin/all'),
  adminCreate: (payload) => apiRequest('/uv-dtf-stickers/admin/create', { method: 'POST', body: payload }),
  adminUpdate: (id, payload) => apiRequest(`/uv-dtf-stickers/admin/${id}`, { method: 'PATCH', body: payload }),
  adminDelete: (id) => apiRequest(`/uv-dtf-stickers/admin/${id}`, { method: 'DELETE' }),
}
