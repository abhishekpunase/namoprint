import { productTypes } from '../data/fallbackCatalog'

/** Parent category (no subcategory parent) for a product type */
export function findParentCategory(categories, productType) {
  if (!productType || !categories?.length) return null
  return categories.find((c) => !c.parent && c.productType === productType) || null
}

/** Category options aligned with product type labels (DB + fallback) */
export function getCategoryOptionsForProductTypes(categories = []) {
  const parents = categories.filter((c) => !c.parent)
  const byType = new Map(parents.map((c) => [c.productType, c]))

  return productTypes.map((pt) => {
    const existing = byType.get(pt.value)
    if (existing) {
      return {
        value: existing._id,
        label: pt.label,
        productType: pt.value,
        isFallback: false,
      }
    }
    return {
      value: `fallback-${pt.value}`,
      label: pt.label,
      productType: pt.value,
      isFallback: true,
    }
  })
}

export function syncCategoryFromProductType(categories, productType, currentCategory = '') {
  const match = findParentCategory(categories, productType)
  if (match) return match._id

  const option = getCategoryOptionsForProductTypes(categories).find((o) => o.productType === productType)
  return option?.value || currentCategory
}

export function syncProductTypeFromCategory(categories, categoryId, currentProductType = '') {
  if (!categoryId) return currentProductType
  if (String(categoryId).startsWith('fallback-')) {
    return categoryId.replace('fallback-', '')
  }
  const cat = categories.find((c) => c._id === categoryId)
  return cat?.productType || currentProductType
}

export function isFallbackCategoryId(categoryId) {
  return String(categoryId || '').startsWith('fallback-')
}

export function productTypeFromFallbackCategoryId(categoryId) {
  return String(categoryId || '').replace('fallback-', '')
}
