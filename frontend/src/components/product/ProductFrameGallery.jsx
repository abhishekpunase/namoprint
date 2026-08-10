import { PreviewFrame } from './PreviewFrame'

const SHAPE_STYLES = {
  round: 'rounded-full aspect-square',
  square: 'rounded-lg aspect-square',
  'square-round': 'rounded-[18px] aspect-square',
  leaf: 'rounded-[40%_60%_40%_60%] aspect-square',
  collage: 'rounded-md aspect-square',
  portrait: 'rounded-md aspect-[3/4]',
}

export function FrameThumbnail({ preset, selected, onClick, size = 'md' }) {
  const shapeClass = SHAPE_STYLES[preset.shape] || SHAPE_STYLES.portrait
  const dim = size === 'sm' ? 'h-14 w-14' : 'h-[72px] w-[72px]'

  return (
    <button
      type="button"
      onClick={onClick}
      title={preset.label}
      className={`group flex shrink-0 flex-col items-center gap-1.5 transition ${
        selected ? 'opacity-100' : 'opacity-80 hover:opacity-100'
      }`}
    >
      <div
        className={`relative ${dim} overflow-hidden border-[3px] border-neutral-800 bg-neutral-900 p-[3px] shadow-md transition ring-offset-2 ${shapeClass} ${
          selected ? 'ring-2 ring-orange-500' : 'group-hover:ring-2 group-hover:ring-orange-300'
        }`}
      >
        <img src={preset.photoUrl} alt={preset.label} className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      </div>
      <span
        className={`max-w-[72px] truncate text-[10px] font-semibold sm:text-xs ${
          selected ? 'text-orange-600' : 'text-gray-500'
        }`}
      >
        {preset.label}
      </span>
    </button>
  )
}

export function ProductFrameGallery({
  product,
  variant,
  presets,
  activePresetId,
  onSelectPreset,
  photoUrl,
  crop,
  text,
  options,
  slotPhotos,
  activeSlot = 0,
  onPhotoSelect,
  onCropChange,
  onSlotActivate,
  onPreviewChange,
  onOptionChange,
  compact = false,
  showLifestyle = false,
  showPresets = false,
}) {
  const activePreset = presets.find((p) => p.id === activePresetId) || presets[0]
  const lifestyleUrl = activePreset?.lifestyleUrl
  const userUploaded = Boolean(photoUrl)

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 ${
          compact ? 'p-2' : 'p-3 sm:p-4'
        }`}
      >
        {showLifestyle && lifestyleUrl && !userUploaded ? (
          <div className="relative">
            <img
              src={lifestyleUrl}
              alt={`${product.title} — ${activePreset?.label}`}
              className={`w-full rounded-xl object-cover ${compact ? 'h-48' : 'h-[320px] sm:h-[420px]'}`}
            />
            <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow">
              {activePreset?.label}
            </span>
          </div>
        ) : (
          <div className="flex w-full items-center justify-center">
            <PreviewFrame
            product={product}
            variant={variant}
            photoUrl={photoUrl}
            crop={crop}
            text={text}
            options={options}
            slotPhotos={slotPhotos}
            activeSlot={activeSlot}
            onPhotoSelect={onPhotoSelect}
            onCropChange={onCropChange}
            onSlotActivate={onSlotActivate}
            onPreviewChange={onPreviewChange}
            onOptionChange={onOptionChange}
            compact={compact}
          />
          </div>
        )}
      </div>

      {showPresets && presets.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 pt-1">
          {presets.map((preset) => (
            <FrameThumbnail
              key={preset.id}
              preset={preset}
              selected={preset.id === activePresetId}
              onClick={() => onSelectPreset(preset)}
              size={compact ? 'sm' : 'md'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
