/**
 * Central map: productType / legacy slug → storefront listing & detail URLs.
 */

export const DEDICATED_CATEGORY_LISTING = {
  'god-photo-frame': '/god-photo-frames',
  'god-photo-frames': '/god-photo-frames',
  'temple-photo-frame': '/god-photo-frames',

  'acrylic-name-plate': '/name-plates',
  'acrylic-monogram-nameplate': '/name-plates',
  'name-plate': '/name-plates',
  'name-plates': '/name-plates',

  'corporate-gift-printing': '/corporate-gifts',
  'corporate-gift': '/corporate-gifts',
  'corporate-gifts': '/corporate-gifts',

  'baby-birth-frame': '/baby-birth-frames',
  'baby-birth-frames': '/baby-birth-frames',
  'baby-frames': '/baby-birth-frames',

  trophy: '/trophies',
  trophies: '/trophies',

  'pen-print': '/pen-print',

  'uv-dtf-stickers': '/uv-dtf-stickers',

  'product-labels': '/product-label-stickers',
  'product-label-stickers': '/product-label-stickers',

  't-shirt-printing': '/t-shirt-printing',
  't-shirts': '/t-shirt-printing',

  'custom-wall-watch': '/custom-wall-watches',
  'photo-clock': '/custom-wall-watches',
  'acrylic-wall-clock': '/custom-wall-watches',
  'custom-wall-watches': '/custom-wall-watches',
}

/** Legacy footer/marketing slugs → catalog productType or dedicated path key */
export const CATEGORY_SLUG_ALIASES = {
  'acrylic-products': 'acrylic-wall-photo',
  'qr-standees': 'logo-stickers',
}

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase()
}

export function getDedicatedListingPath(productTypeOrSlug) {
  const key = normalizeKey(productTypeOrSlug)
  return DEDICATED_CATEGORY_LISTING[key] || null
}

export function resolveCategoryLink(productTypeOrSlug) {
  const key = normalizeKey(productTypeOrSlug)
  if (!key) return '/products'

  const dedicated = DEDICATED_CATEGORY_LISTING[key]
  if (dedicated) return dedicated

  const alias = CATEGORY_SLUG_ALIASES[key]
  if (alias) {
    const aliasDedicated = DEDICATED_CATEGORY_LISTING[alias]
    if (aliasDedicated) return aliasDedicated
    return `/products?type=${encodeURIComponent(alias)}`
  }

  return `/products?type=${encodeURIComponent(key)}`
}

/** Resolve /category/:type legacy URLs */
export function resolveCategoryNavigatePath(categoryType) {
  return resolveCategoryLink(categoryType)
}

export function getProductDetailPath(product) {
  if (!product?.slug) return '/products'
  const base = getDedicatedListingPath(product.productType)
  if (base) return `${base}/${product.slug}`
  return `/products/${product.slug}`
}

/** Prefer dedicated module pages over legacy /products?type= links */
export function normalizeCategoryLink(item) {
  const productType = item?.productType || item?.value || ''
  const custom = item?.linkUrl?.trim()
  if (custom && !custom.startsWith('/products?type=')) {
    return custom
  }
  return resolveCategoryLink(productType)
}
