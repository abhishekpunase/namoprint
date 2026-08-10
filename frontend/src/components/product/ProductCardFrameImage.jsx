import { useMemo, useState } from 'react'
import { getProductBaseImage } from '../../data/fallbackCatalog'
import { getProductCardThumbnails, getProductFramePresets } from '../../data/productFrameGallery'
import { resolveMediaUrl, resolveProductImage } from '../../utils/mediaUrl'

const SHAPE_STYLES = {
  round: 'rounded-full aspect-square',
  square: 'rounded-lg aspect-square',
  leaf: 'rounded-[40%_60%_40%_60%] aspect-square',
  collage: 'rounded-md aspect-square',
  portrait: 'rounded-md aspect-[3/4]',
}

const SIZE_BY_SHAPE = {
  round: 'h-44 w-44 sm:h-48 sm:w-48',
  square: 'h-44 w-44 sm:h-48 sm:w-48',
  leaf: 'h-44 w-44 sm:h-48 sm:w-48',
  collage: 'h-44 w-44 sm:h-48 sm:w-48',
  portrait: 'h-52 w-40 sm:h-56 sm:w-44',
}

/** Product types that show the real uploaded photo on cards (not dummy frame presets). */
const LIVE_CARD_IMAGE_TYPES = new Set(['acrylic-name-plate', 'god-photo-frame'])

function LiveProductCardImage({ product, className = '', fit = 'contain', compact = false }) {
  const candidates = useMemo(() => {
    const urls = (product?.images || []).map((url) => resolveMediaUrl(url)).filter(Boolean)
    const base = resolveMediaUrl(getProductBaseImage(product))
    if (base && !urls.includes(base)) urls.unshift(base)
    const thumb = getProductCardThumbnails(product)[0]?.image
    if (thumb) urls.push(resolveMediaUrl(thumb))
    return [...new Set(urls.filter(Boolean))]
  }, [product])

  const [index, setIndex] = useState(0)
  const src = candidates[index] || ''

  if (compact) {
    return (
      <div className={`overflow-hidden bg-white ${className}`}>
        {src ? (
          <img
            src={src}
            alt={product?.title || 'Product'}
            className="block w-full h-auto"
            loading="lazy"
            onError={() => {
              if (index < candidates.length - 1) setIndex((i) => i + 1)
            }}
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-neutral-100 text-sm text-neutral-500">
            No image
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`flex h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={product?.title || 'Product'}
          className={fit === 'cover' ? 'h-full w-full object-cover' : 'max-h-full max-w-full object-contain drop-shadow-lg'}
          loading="lazy"
          onError={() => {
            if (index < candidates.length - 1) setIndex((i) => i + 1)
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-sm text-neutral-500">
          No image
        </div>
      )}
    </div>
  )
}

/** Home / catalog — admin thumbnail, live product photo, or styled preset */
export function ProductCardFrameImage({ product, productType, className = '' }) {
  const resolvedType = productType || product?.productType || 'acrylic-photo-frame'
  const adminThumbnail = resolveMediaUrl(product?.thumbnail)

  if (adminThumbnail) {
    return (
      <div
        className={`flex h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 ${className}`}
      >
        <img
          src={adminThumbnail}
          alt={product?.title || 'Product'}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  const liveImage = resolveProductImage(product)
  const useLivePhoto =
    Boolean(liveImage) &&
    (LIVE_CARD_IMAGE_TYPES.has(resolvedType) || (resolvedType === 'god-photo-frame' && product?.images?.length))

  const previewProduct = useMemo(
    () => ({
      ...product,
      productType: resolvedType,
    }),
    [product, resolvedType],
  )
  const preset = useMemo(() => getProductFramePresets(previewProduct)[0], [previewProduct])

  if (useLivePhoto) {
    return (
      <LiveProductCardImage
        product={product}
        className={className}
        fit={resolvedType === 'god-photo-frame' ? 'cover' : 'contain'}
        compact={resolvedType === 'god-photo-frame'}
      />
    )
  }

  if (!preset) return null

  const shape = preset.shape || 'portrait'
  const shapeClass = SHAPE_STYLES[shape] || SHAPE_STYLES.portrait
  const sizeClass = SIZE_BY_SHAPE[shape] || SIZE_BY_SHAPE.portrait
  const presetUrl = resolveMediaUrl(preset.photoUrl)

  return (
    <div
      className={`flex h-64 items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 ${className}`}
    >
      <div
        className={`relative overflow-hidden border-[5px] border-neutral-800 bg-neutral-900 p-1.5 shadow-lg ${shapeClass} ${sizeClass}`}
      >
        <img
          src={presetUrl}
          alt={product?.title || preset.label}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
      </div>
    </div>
  )
}
