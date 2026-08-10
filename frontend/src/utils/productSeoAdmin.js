/** Shared admin ↔ API ↔ storefront product SEO helpers */

export const emptySeoFormFields = {
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
}

export function seoFieldsFromProduct(product) {
  return {
    seoTitle: product?.seo?.title || '',
    seoDescription: product?.seo?.description || '',
    seoKeywords: (product?.seo?.keywords || []).join(', '),
  }
}

export function buildSeoPayload(form) {
  const title = form.seoTitle?.trim()
  const description = form.seoDescription?.trim()
  const keywords = (form.seoKeywords || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)

  if (!title && !description && !keywords.length) return {}

  return {
    seo: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(keywords.length ? { keywords } : {}),
    },
  }
}

export function previewSlugFromTitle(title) {
  return (title || 'your-product')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
