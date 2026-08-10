import { FiImage } from 'react-icons/fi'

const clockNumbers = [
  ['12', 50, 9],
  ['1', 68, 14],
  ['2', 82, 28],
  ['3', 88, 50],
  ['4', 82, 72],
  ['5', 68, 86],
  ['6', 50, 91],
  ['7', 32, 86],
  ['8', 18, 72],
  ['9', 12, 50],
  ['10', 18, 28],
  ['11', 32, 14],
]

const getClockShapeClass = (shape = '') => {
  const normalized = shape.toLowerCase()
  if (normalized.includes('heart')) return 'clock-shape-heart'
  if (normalized.includes('circle')) return 'clock-shape-circle'
  if (normalized.includes('leaf')) return 'clock-shape-leaf'
  return 'clock-shape-square'
}

const getSlotLayout = (options, productType) => {
  if (productType === 'custom-wall-watch' && options?.shape?.includes('Four Photo')) return 'clock-collage'
  if (productType === 'photo-album') return 'album-grid'
  if (productType === 'acrylic-photo-mini-wall-gallery') return 'gallery-grid'
  if (options?.layout === 'Collage') return 'frame-collage'
  return 'single'
}

function PhotoSlot({ src, label, crop }) {
  return (
    <div className="preview-slot">
      {src ? (
        <img
          src={src}
          alt={label}
          style={{
            transform: `scale(${crop?.scale || 1}) rotate(${crop?.rotate || 0}deg)`,
            objectPosition: `${50 - (crop?.x || 0) * 20}% ${50 - (crop?.y || 0) * 20}%`,
          }}
        />
      ) : (
        <div className="preview-empty">
          <FiImage />
          {label}
        </div>
      )}
    </div>
  )
}

function ClockFace({ options }) {
  const dialStyle = options?.dialStyle || 'Modern Numbers'
  const hands = options?.clockHands || 'Classic Silver'

  return (
    <div className={`clock-face ${hands.toLowerCase().replaceAll(' ', '-')}`}>
      {dialStyle !== 'No Numbers' &&
        clockNumbers.map(([number, left, top]) => (
          <span className={dialStyle === 'Minimal Marks' ? 'clock-mark minimal' : 'clock-mark'} key={number} style={{ left: `${left}%`, top: `${top}%` }}>
            {dialStyle === 'Minimal Marks' ? '|' : number}
          </span>
        ))}
      <span className="clock-hand hour-hand" />
      <span className="clock-hand minute-hand" />
      <span className="clock-hand second-hand" />
      <span className="clock-pin" />
    </div>
  )
}

export function PreviewFrame({ product, photoUrl, crop, text = {}, options = {}, slotPhotos = [] }) {
  const canvas = product?.mockup?.canvas || { width: 1000, height: 1000 }
  const box = product?.mockup?.photoBox || { x: 120, y: 120, width: 760, height: 760, borderRadius: 20 }
  const aspect = `${canvas.width} / ${canvas.height}`
  const textValues = Object.values(text).filter(Boolean)
  const isClock = product?.productType === 'custom-wall-watch'
  const slotLayout = getSlotLayout(options, product?.productType)
  const shapeClass = isClock ? getClockShapeClass(options.shape || product?.defaultOptions?.shape || product?.variants?.[0]?.frameType) : ''
  const photos = slotPhotos.length ? slotPhotos : photoUrl ? [{ url: photoUrl }] : []

  const handleCanvasClick = async (e) => {
    const res = await fetch(e.target.src)
    const blob = await res.blob()
  }

  return (
    <div className={` ${isClock ? 'clock-preview-shell' : ''}`} style={{ aspectRatio: aspect }}>
      {/* <div className="preview-bg" /> */}
      {/* <div
        className={`preview-photo-box ${shapeClass}`}
        style={{
          left: `${(box.x / canvas.width) * 100}%`,
          top: `${(box.y / canvas.height) * 100}%`,
          width: `${(box.width / canvas.width) * 100}%`,
          height: `${(box.height / canvas.height) * 100}%`,
          borderRadius: `${box.borderRadius || 0}px`,
          transform: `rotate(${box.rotate || 0}deg)`,
        }}
      >
        <div className={`preview-slots ${slotLayout}`}>
          {(slotLayout === 'single' ? [photos[0]] : Array.from({ length: Math.min(Math.max(photos.length, 4), 9) })).map((photo, index) => (
            <PhotoSlot key={index} src={photo?.url} crop={photo?.crop || crop} label={`Upload Photo ${index + 1}`} />
          ))}
        </div>
        {isClock && <ClockFace options={options} />}
      </div> */}
      {/* <div className="preview-glass" /> */}
      {textValues.length > 0 && (
        <div className="preview-text">
          {textValues.map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
      )}

      <img
      onClick={handleCanvasClick}
        src={'/canvas.webp'}
        alt="canvas"
      />

    <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

    </div>
  )
}

