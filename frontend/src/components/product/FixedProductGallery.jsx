import { resolveMediaUrl } from '../../utils/mediaUrl'

/**
 * Product gallery with a fixed main image frame so switching thumbnails
 * never changes layout size (object-fit: cover + overflow: hidden).
 */
export function FixedProductGallery({
  images = [],
  activeIndex = 0,
  onSelect,
  alt = 'Product',
  aspectClass = 'aspect-square',
  thumbClass = 'h-20 w-20',
  frameClass = 'rounded-3xl border border-orange-100 bg-neutral-50 shadow-sm',
  thumbFrameClass = 'rounded-xl border-2',
  activeThumbClass = 'border-orange-500',
  inactiveThumbClass = 'border-transparent hover:border-orange-200',
}) {
  const resolved = images.map((url) => resolveMediaUrl(url)).filter(Boolean)
  if (!resolved.length) {
    return (
      <div
        className={`flex w-full items-center justify-center overflow-hidden text-sm text-slate-500 ${aspectClass} ${frameClass}`}
      >
        No image
      </div>
    )
  }

  const safeIndex = Math.min(Math.max(activeIndex, 0), resolved.length - 1)

  return (
    <div>
      <div className={`relative w-full overflow-hidden ${aspectClass} ${frameClass}`}>
        <img
          src={resolved[safeIndex]}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </div>

      {resolved.length > 1 && onSelect ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {resolved.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === safeIndex ? 'true' : undefined}
              className={`${thumbClass} shrink-0 overflow-hidden ${thumbFrameClass} transition ${
                index === safeIndex ? activeThumbClass : inactiveThumbClass
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover object-center" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
