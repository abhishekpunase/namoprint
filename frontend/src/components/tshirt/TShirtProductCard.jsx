import { FiArrowRight, FiStar } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/format'
import { resolveMediaUrl } from '../../utils/mediaUrl'

export function TShirtProductCard({ product }) {
  const discount =
    product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0

  const detailPath = `/t-shirt-printing/${product.slug}`
  const mainSrc = resolveMediaUrl(product.images?.[0])

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400" />

      <Link to={detailPath} className="relative block shrink-0 overflow-hidden bg-neutral-50">
        <span className="absolute right-3 top-3 z-10 rounded-full bg-black/75 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          Custom Print
        </span>
        {mainSrc ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <img
              src={mainSrc}
              alt={product.title}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-neutral-100 text-sm text-neutral-500">
            No image
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
            T-Shirt Print
          </span>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5">
            <FiStar className="h-3.5 w-3.5 fill-orange-400 text-orange-500" />
            <span className="text-xs font-semibold text-gray-700">{product.rating?.toFixed(1) || '4.5'}</span>
          </div>
        </div>

        <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-orange-600">
          {product.title}
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] text-gray-500">Starting at</div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xl font-extrabold text-orange-600">{formatCurrency(product.price)}</span>
              {product.compareAtPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">{formatCurrency(product.compareAtPrice)}</span>
              )}
              {discount > 0 && (
                <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  -{discount}%
                </span>
              )}
            </div>
          </div>

          <Link
            to={detailPath}
            className="group/button inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-orange-400/40"
          >
            Customize
            <FiArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
