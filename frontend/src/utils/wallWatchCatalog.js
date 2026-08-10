/** Product types shown on /custom-wall-watches (removed from main shop) */
export const WALL_WATCH_PRODUCT_TYPES = ['custom-wall-watch', 'photo-clock']

export function isWallWatchProduct(product) {
  return WALL_WATCH_PRODUCT_TYPES.includes(product?.productType)
}

export function filterWallWatchProducts(products = []) {
  return products.filter(isWallWatchProduct)
}

export function excludeWallWatchProducts(products = []) {
  return products.filter((p) => !isWallWatchProduct(p))
}

export const WALL_WATCH_CATALOG_BASE = '/custom-wall-watches'
