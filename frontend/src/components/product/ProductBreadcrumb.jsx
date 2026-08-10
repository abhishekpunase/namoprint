import { FiChevronRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const CATALOG_CRUMBS = {
  '/god-photo-frames': 'God Frames',
  '/name-plates': 'Name Plates',
  '/pen-print': 'Pen Print',
  '/uv-dtf-stickers': 'UV DTF Stickers',
  '/product-label-stickers': 'Product Label Stickers',
  '/corporate-gifts': 'Corporate Gifts',
  '/baby-birth-frames': 'Baby Birth Frames',
  '/trophies': 'Trophies',
  '/t-shirt-printing': 'T-Shirts',
  '/custom-wall-watches': 'Wall Watches',
  '/products': 'Shop',
}

/**
 * Storefront breadcrumb: Home > Category > Product title
 * Used on God, Name Plate, T-Shirt, Wall Watch and shop product pages.
 */
export function ProductBreadcrumb({ categoryPath, categoryLabel, productTitle, className = '' }) {
  const label = categoryLabel || CATALOG_CRUMBS[categoryPath] || 'Products'

  if (!productTitle) return null

  return (
    <nav
      className={`mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500 ${className}`.trim()}
      aria-label="Breadcrumb"
    >
      <Link to="/" className="transition hover:text-orange-600">
        Home
      </Link>
      <FiChevronRight className="h-4 w-4 shrink-0" aria-hidden />
      {categoryPath ? (
        <>
          <Link to={categoryPath} className="transition hover:text-orange-600">
            {label}
          </Link>
          <FiChevronRight className="h-4 w-4 shrink-0" aria-hidden />
        </>
      ) : null}
      <span className="font-medium text-slate-800">{productTitle}</span>
    </nav>
  )
}

/** Orange category pill shown above product title on detail pages */
export function ProductCategoryBadge({ children, className = '' }) {
  return (
    <span
      className={`inline-block rounded-full bg-orange-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600 ${className}`.trim()}
    >
      {children}
    </span>
  )
}
