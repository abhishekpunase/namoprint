import { fallbackProducts } from '../data/fallbackCatalog'

/** API + fallback merge — same slug par API product prefer hoti hai */
export function mergeCatalogProducts(apiItems = []) {
  const bySlug = new Map()
  for (const product of fallbackProducts) {
    bySlug.set(product.slug, product)
  }
  for (const product of apiItems) {
    if (product?.slug) bySlug.set(product.slug, product)
  }
  return Array.from(bySlug.values())
}
