export const emptyCategoryForm = {
  name: '',
  slug: '',
  productType: 'acrylic-wall-photo',
  parent: '',
  description: '',
  shortDescription: '',
  imageUrl: '',
  bannerUrl: '',
  icon: '',
  sortOrder: '0',
  isActive: true,
  // TODO: not persisted — no backend field yet
  isFeatured: false,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  canonicalUrl: '',
  ogImage: '',
  categoryColor: '#4f46e5',
  homepageVisible: true,
  navVisible: true,
}

export function slugFromName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function categoryToForm(category) {
  return {
    name: category.name || '',
    slug: category.slug || '',
    productType: category.productType || 'acrylic-wall-photo',
    parent: category.parent?._id || category.parent || '',
    description: category.description || '',
    shortDescription: '',
    imageUrl: category.imageUrl || '',
    bannerUrl: '',
    icon: '',
    sortOrder: String(category.sortOrder ?? 0),
    isActive: category.isActive !== false,
    isFeatured: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    canonicalUrl: '',
    ogImage: '',
    categoryColor: '#4f46e5',
    homepageVisible: true,
    navVisible: true,
  }
}

/** Payload matches existing category API schema only. */
export function buildCategoryPayload(form) {
  return {
    name: form.name.trim(),
    productType: form.productType,
    description: form.description || undefined,
    imageUrl: form.imageUrl || undefined,
    sortOrder: Number(form.sortOrder || 0),
    isActive: form.isActive,
    parent: form.parent || undefined,
  }
}

export function getCategoryParentId(category) {
  return category.parent?._id || category.parent || ''
}

export function getCategoryParentName(category, categories = []) {
  const parentId = getCategoryParentId(category)
  if (!parentId) return '—'
  const parent = categories.find((c) => c._id === parentId)
  return parent?.name || category.parent?.name || '—'
}

export function getCategoryStatus(category) {
  if (!category.isActive) return { label: 'Inactive', tone: 'neutral' }
  return { label: 'Active', tone: 'success' }
}

export function countProductsForCategory(categoryId, products = []) {
  if (!categoryId) return 0
  return products.filter((p) => {
    const cat = p.category?._id || p.category
    const sub = p.subCategory?._id || p.subCategory
    return cat === categoryId || sub === categoryId
  }).length
}

export function getProductsForCategory(categoryId, products = []) {
  if (!categoryId) return []
  return products.filter((p) => {
    const cat = p.category?._id || p.category
    const sub = p.subCategory?._id || p.subCategory
    return cat === categoryId || sub === categoryId
  })
}

export function buildCategoryTree(categories = []) {
  const byId = new Map(categories.map((c) => [c._id, { ...c, children: [] }]))
  const roots = []

  for (const cat of byId.values()) {
    const parentId = getCategoryParentId(cat)
    if (parentId && byId.has(parentId) && parentId !== cat._id) {
      byId.get(parentId).children.push(cat)
    } else {
      roots.push(cat)
    }
  }

  const sortNodes = (nodes) => {
    nodes.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name))
    nodes.forEach((n) => sortNodes(n.children))
  }
  sortNodes(roots)
  return roots
}

export function flattenCategoryTree(tree, depth = 0, acc = []) {
  for (const node of tree) {
    acc.push({ ...node, depth })
    if (node.children?.length) flattenCategoryTree(node.children, depth + 1, acc)
  }
  return acc
}

export function findCategoryById(id, categories = []) {
  return categories.find((c) => c._id === id) || null
}
