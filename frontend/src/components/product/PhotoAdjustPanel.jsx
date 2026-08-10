import { FiEdit3, FiMaximize2, FiRotateCw } from 'react-icons/fi'

export function PhotoAdjustPanel({
  crop,
  onCropChange,
  activeSlotIndex = 0,
  slotCount = 1,
  textFields = [],
  text = {},
  onTextChange,
  showPhotoControls = true,
  className = '',
}) {
  const scale = crop?.scale ?? 1
  const rotate = crop?.rotate ?? 0
  const slotLabel = slotCount > 1 ? ` — photo ${activeSlotIndex + 1}` : ''

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {showPhotoControls && (
        <>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Adjust photo{slotLabel}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <FiMaximize2 className="h-3.5 w-3.5 text-fuchsia-500" /> Scale
              </span>
              <input
                min="0.5"
                max="3"
                step="0.05"
                type="range"
                value={scale}
                onChange={(e) => onCropChange({ scale: Number(e.target.value) })}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-fuchsia-100 accent-fuchsia-500"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <FiRotateCw className="h-3.5 w-3.5 text-amber-500" /> Rotate
              </span>
              <input
                min="-45"
                max="45"
                step="1"
                type="range"
                value={rotate}
                onChange={(e) => onCropChange({ rotate: Number(e.target.value) })}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-amber-100 accent-amber-500"
              />
            </label>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Tip: click a photo in the frame to select it, then use scale/rotate. Drag to reposition, or scroll to zoom.
          </p>
        </>
      )}

      {textFields.length > 0 && !showPhotoControls && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Custom text
        </p>
      )}

      {textFields.map((field) => (
        <label
          key={field}
          className={`flex flex-col gap-2 text-sm font-semibold text-slate-700 ${showPhotoControls ? 'mt-4' : ''}`}
        >
          <span className="flex items-center gap-1.5">
            <FiEdit3 className="h-3.5 w-3.5 text-indigo-500" />
            {field.replace(/([A-Z])/g, ' $1')}
          </span>
          <input
            value={text[field] || ''}
            onChange={(e) => onTextChange(field, e.target.value)}
            placeholder="Add custom text"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-normal text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </label>
      ))}
    </div>
  )
}
