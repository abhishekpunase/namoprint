import { apiRequest } from './api'
import { createStorefrontList } from '../utils/fetchAllProducts'

export const productLabelStickerApi = {
  list: createStorefrontList(apiRequest, '/product-label-stickers'),
  get: (slug) => apiRequest(`/product-label-stickers/${slug}`),

  adminList: () => apiRequest('/product-label-stickers/admin/all'),
  adminCreate: (payload) =>
    apiRequest('/product-label-stickers/admin/create', { method: 'POST', body: payload }),
  adminUpdate: (id, payload) =>
    apiRequest(`/product-label-stickers/admin/${id}`, { method: 'PATCH', body: payload }),
  adminDelete: (id) => apiRequest(`/product-label-stickers/admin/${id}`, { method: 'DELETE' }),
}
