import { useMemo } from 'react'
import { FiArrowRight, FiStar } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { getProductImage } from '../../data/fallbackCatalog'
import { getProductCardThumbnails } from '../../data/productFrameGallery'
import { formatCurrency, getCompareAtPrice, getProductPrice } from '../../utils/format'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import { WALL_WATCH_CATALOG_BASE } from '../../utils/wallWatchCatalog'

function hashSlug(slug = '') {
  return slug.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function resolveWallWatchCardImage(product) {
  const thumb = resolveMediaUrl(product?.thumbnail)
  if (thumb) return thumb

  const img = resolveMediaUrl(product?.images?.[0])
  if (img) return img

  const thumbs = getProductCardThumbnails(product)
  if (thumbs.length) {
    const index = Math.abs(hashSlug(product?.slug)) % thumbs.length
    const picked = resolveMediaUrl(thumbs[index]?.image)
    if (picked) return picked
  }

  return resolveMediaUrl(product?.mockup?.frameImage) || resolveMediaUrl(getProductImage(product)) || ''
}

function StarRating({ value = 4.5 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <FiStar
          key={index}
          className={`h-3.5 w-3.5 ${
            index < Math.floor(value) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
          }`}
        />
      ))}
      <span className="ml-0.5 text-xs text-slate-500">({value.toFixed(1)})</span>
    </div>
  )
}

export function WallWatchProductCard({ product }) {
  const price = getProductPrice(product)
  const compareAt = getCompareAtPrice(product)
  const discount = compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0
  const detailPath = `${WALL_WATCH_CATALOG_BASE}/${product.slug}`
  const mainSrc = useMemo(() => resolveWallWatchCardImage(product), [product])
  const shapeLabel =
    product?.defaultOptions?.shape ||
    product?.variants?.[0]?.frameType ||
    product?.productType?.replaceAll('-', ' ')

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400" />

      <Link to={detailPath} className="relative block shrink-0 overflow-hidden bg-slate-100">
        {shapeLabel ? (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
            {shapeLabel}
          </span>
        ) : null}
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
          <div className="flex aspect-[4/3] w-full items-center justify-center text-sm text-slate-500">
            No image
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <Link to={detailPath}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-orange-600">
            {product.title}
          </h3>
        </Link>

        <StarRating value={product?.rating || 4.5} />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl font-extrabold text-orange-600">{formatCurrency(price)}</span>
          {compareAt > price && (
            <span className="text-sm text-slate-400 line-through">{formatCurrency(compareAt)}</span>
          )}
          {discount > 0 && (
            <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              SAVE {discount}%
            </span>
          )}
        </div>

        <Link
          to={detailPath}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
        >
          Customise
          <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
