import { fetchAllAdminProducts } from '../utils/adminProductCatalog'
import { api } from './api'
import { filterWallWatchProducts } from '../utils/wallWatchCatalog'

export const wallWatchApi = {
  list: (query = '') =>
    api.products(query).then((payload) => ({
      ...payload,
      items: filterWallWatchProducts(payload.items || []),
    })),

  adminList: async () => {
    const items = await fetchAllAdminProducts()
    const watches = filterWallWatchProducts(items)
    return {
      success: true,
      items: watches,
      pagination: { total: watches.length, page: 1, limit: watches.length },
    }
  },

  adminCreate: (body) => api.adminCreateProduct(body),

  adminUpdate: (id, body) => api.adminUpdateProduct(id, body),

  adminDelete: (id) => api.adminDeleteProduct(id),
}
