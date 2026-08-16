import { useMemo, useState } from 'react'
import { getProductImage, getProductBaseImage, mockupImages } from '../../data/fallbackCatalog'
import { getProductCardThumbnails, getProductFramePresets } from '../../data/productFrameGallery'
import { isLikelyMediaUrl, resolveMediaUrl, resolveProductImage } from '../../utils/mediaUrl'

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

function CardImageShell({ className = '', children }) {
  return (
    <div
      className={`flex h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 ${className}`}
    >
      {children}
    </div>
  )
}

function collectCardImageCandidates(product) {
  const urls = []
  const push = (raw) => {
    const resolved = resolveMediaUrl(raw)
    if (resolved && isLikelyMediaUrl(resolved) && !urls.includes(resolved)) {
      urls.push(resolved)
    }
  }

  push(product?.thumbnail)
  for (const image of product?.images || []) push(image)
  push(product?.mockup?.baseImageUrl)
  push(product?.mockup?.frameImage)
  push(getProductBaseImage(product))
  push(getProductImage(product))

  const thumb = getProductCardThumbnails(product)[0]?.image
  push(thumb)

  const preset = getProductFramePresets(product)[0]
  push(preset?.photoUrl)

  push(mockupImages.portrait)
  return urls
}

function CascadingProductImage({
  candidates,
  alt,
  className,
  fit = 'contain',
  compact = false,
}) {
  const [index, setIndex] = useState(0)
  const src = candidates[index] || ''

  const advance = () => {
    if (index < candidates.length - 1) setIndex((i) => i + 1)
  }

  if (!src) {
    return (
      <div className="flex h-full min-h-48 w-full items-center justify-center bg-neutral-100 text-sm text-neutral-500">
        No image
      </div>
    )
  }

  if (compact) {
    return (
      <img
        src={src}
        alt={alt}
        className={className || 'block h-auto w-full'}
        loading="lazy"
        decoding="async"
        onError={advance}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={
        className ||
        (fit === 'cover'
          ? 'h-full w-full object-cover'
          : 'max-h-full max-w-full object-contain drop-shadow-lg')
      }
      loading="lazy"
      decoding="async"
      onError={advance}
    />
  )
}

/** Home / catalog — admin thumbnail, mockup frame, live product photo, or styled preset */
export function ProductCardFrameImage({ product, productType, className = '' }) {
  const resolvedType = productType || product?.productType || 'acrylic-photo-frame'

  const candidates = useMemo(() => collectCardImageCandidates(product), [product])

  const previewProduct = useMemo(
    () => ({
      ...product,
      productType: resolvedType,
    }),
    [product, resolvedType],
  )
  const preset = useMemo(() => getProductFramePresets(previewProduct)[0], [previewProduct])

  const liveImage = resolveProductImage(product)
  const useLivePhoto =
    Boolean(liveImage) &&
    (LIVE_CARD_IMAGE_TYPES.has(resolvedType) ||
      (resolvedType === 'god-photo-frame' && product?.images?.length))

  const useFramedPreset =
    !product?.thumbnail &&
    !product?.images?.length &&
    !product?.mockup?.frameImage &&
    Boolean(preset) &&
    !useLivePhoto

  if (useFramedPreset) {
    const shape = preset.shape || 'portrait'
    const shapeClass = SHAPE_STYLES[shape] || SHAPE_STYLES.portrait
    const sizeClass = SIZE_BY_SHAPE[shape] || SIZE_BY_SHAPE.portrait
    const framedCandidates = [
      resolveMediaUrl(preset.photoUrl),
      ...candidates,
    ].filter((url, i, arr) => url && isLikelyMediaUrl(url) && arr.indexOf(url) === i)

    return (
      <div
        className={`flex h-64 items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 ${className}`}
      >
        <div
          className={`relative overflow-hidden border-[5px] border-neutral-800 bg-neutral-900 p-1.5 shadow-lg ${shapeClass} ${sizeClass}`}
        >
          <CascadingProductImage
            candidates={framedCandidates}
            alt={product?.title || preset.label}
            className="h-full w-full object-cover"
            fit="cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
        </div>
      </div>
    )
  }

  if (useLivePhoto && resolvedType === 'god-photo-frame') {
    return (
      <div className={`overflow-hidden bg-white ${className}`}>
        <CascadingProductImage
          candidates={candidates}
          alt={product?.title || 'Product'}
          compact
        />
      </div>
    )
  }

  return (
    <CardImageShell className={className}>
      <CascadingProductImage
        candidates={candidates}
        alt={product?.title || 'Product'}
        fit={resolvedType === 'god-photo-frame' ? 'cover' : 'contain'}
      />
    </CardImageShell>
  )
}
