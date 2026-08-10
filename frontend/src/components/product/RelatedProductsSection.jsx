import { Children } from 'react'
import { Link } from 'react-router-dom'

/**
 * Shared "You may also like" block for product detail pages.
 * Pass category product cards as children.
 */
export function RelatedProductsSection({
  viewAllHref,
  viewAllLabel = 'View all',
  title = 'Related Products',
  gridClassName = 'sm:grid-cols-2 lg:grid-cols-4',
  children,
}) {
  const items = Children.toArray(children).filter(Boolean)
  if (!items.length) return null

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500">You may also like</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
        </div>
        {viewAllHref ? (
          <Link to={viewAllHref} className="text-sm font-semibold text-orange-600 hover:underline">
            {viewAllLabel}
          </Link>
        ) : null}
      </div>
      <div className={`grid gap-6 ${gridClassName}`}>{items}</div>
    </section>
  )
}
