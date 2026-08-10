import { useEffect, useMemo, useRef, useState } from 'react'
import { FiImage, FiUpload, FiType, FiBox, FiX, FiRotateCw, FiTrash2, FiMove, FiPlay, FiPause } from 'react-icons/fi'
import { getProductFrameImage, getProductBaseImage, usesLiveProductImage } from '../../data/fallbackCatalog'
import { getFinishStyle, getFrameStyleHint, hexToRgba, parseMaterialThickness } from '../../data/frameVisuals'
import { resolveCollageMockup, resolvePreviewPhotoBoxes } from '../../data/collageFrameMockup'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import { punchFrameHoles, shouldPunchFrameHoles, inferSlotClipPathsFromFrame } from '../../utils/frameImageUtils'
import { photoBoxToStyle, resolveMockupLayout } from '../../utils/mockupLayout'
import { HEX_PHOTO_FILL_SCALE, isHexClipPath } from '../../utils/mockupSlotShapes'
import { wallWatchShouldUseSvgFrame } from '../../utils/wallWatchFrameUtils'

/** Place 1–12 evenly on a circle — real watch jaisa dial */
function buildClockNumberRing(radiusPct = 41) {
  const cx = 50
  const cy = 50
  return Array.from({ length: 12 }, (_, i) => {
    const hour = i === 0 ? 12 : i
    const angleRad = ((i * 30 - 90) * Math.PI) / 180
    return [
      String(hour),
      Math.round((cx + radiusPct * Math.cos(angleRad)) * 10) / 10,
      Math.round((cy + radiusPct * Math.sin(angleRad)) * 10) / 10,
    ]
  })
}

const clockNumbers = buildClockNumberRing(41)

const CLOCK_NUMBER_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#111827' },
  { name: 'Gold', value: '#eab308' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Silver', value: '#cbd5e1' },
]

function resolveNumberColor(value) {
  if (!value) return '#ffffff'
  if (String(value).startsWith('#')) return value
  const match = CLOCK_NUMBER_COLORS.find((entry) => entry.name.toLowerCase() === String(value).toLowerCase())
  return match?.value || '#ffffff'
}

const getClockShapeClass = (shape = '', frameStyle = '', frameType = '') => {
  const normalized = `${shape} ${frameStyle} ${frameType}`.toLowerCase()
  if (normalized.includes('collage')) return 'clock-shape-collage'
  if (normalized.includes('triangle')) return 'clock-shape-triangle'
  if (normalized.includes('hex')) return 'clock-shape-hexagon'
  if (normalized.includes('octagon')) return 'clock-shape-octagon'
  if (normalized.includes('pentagon')) return 'clock-shape-pentagon'
  if (normalized.includes('diamond')) return 'clock-shape-diamond'
  if (normalized.includes('star')) return 'clock-shape-star'
  if (normalized.includes('arch')) return 'clock-shape-arch'
  if (normalized.includes('half')) return 'clock-shape-half'
  if (normalized.includes('oval')) return 'clock-shape-oval'
  if (normalized.includes('heart')) return 'clock-shape-heart'
  if (normalized.includes('leaf')) return 'clock-shape-leaf'
  if (
    normalized.includes('circle') ||
    normalized.includes('square round') ||
    /\bround\b/.test(normalized)
  ) {
    return 'clock-shape-circle'
  }
  if (normalized.includes('square')) return 'clock-shape-square'
  return 'clock-shape-square'
}

/** Detect circular dial from mockup photoBox (borderRadius ≈ half of min side) */
function isCircularPhotoBox(photoBox) {
  if (!photoBox?.width || !photoBox?.height) return false
  const minDim = Math.min(photoBox.width, photoBox.height)
  const br = Number(photoBox.borderRadius) || 0
  return br >= minDim / 2 - 4
}

function isCircularPreview(shapeClass, photoBox) {
  return shapeClass.includes('circle') || isCircularPhotoBox(photoBox)
}

const getSlotLayout = (options, productType) => {
  if (productType === 'photo-collage') return 'frame-collage'
  if (
    productType === 'custom-wall-watch' &&
    (options?.collageEnabled ||
      Number(options?.collagePhotoCount) > 1 ||
      options?.shape?.includes('Four Photo'))
  ) {
    return 'clock-collage'
  }
  if (productType === 'photo-album') return 'album-grid'
  if (productType === 'acrylic-photo-mini-wall-gallery') return 'gallery-grid'
  if (options?.layout === 'Collage') return 'frame-collage'
  return 'single'
}

/** Wall / photo clocks always show dial — collage slots ke upar numbers + hands */
function shouldShowClockDial(product) {
  return product?.productType === 'custom-wall-watch' || product?.productType === 'photo-clock'
}

const DEFAULT_FRAME_COLORS = [
  { name: 'White', value: '#ffffff', border: '#d1d5db' },
  { name: 'Blue', value: '#1d3fd6', border: '#1d3fd6' },
  { name: 'Black', value: '#111111', border: '#111111' },
]

// Wall-art sizes (inches). Orientation toggle decides how w/h are applied.
const DEFAULT_SIZES = [
  { label: '9x12', w: 9, h: 12 },
  { label: '12x16', w: 12, h: 16 },
  { label: '12x18', w: 12, h: 18 },
  { label: '15x21', w: 15, h: 21 },
  { label: '20x30', w: 20, h: 30 },
  { label: '23x35', w: 23, h: 35 },
  { label: '36x48', w: 36, h: 48 },
]

// Thickness (mm) -> visual border width (px)
const DEFAULT_THICKNESS = [
  { label: '3mm', px: 6 },
  { label: '5mm', px: 12 },
  { label: '8mm', px: 20 },
]

const TEXT_COLORS = [
  '#000000', '#ffffff', '#ef4444', '#22c55e', '#2563eb', '#eab308', '#d946ef', '#06b6d4',
  '#f97316', '#7c3aed', '#ec4899', '#14b8a6', '#facc15', '#f87171',
]

const FONT_STYLES = [
  // Normal
  "Arial",
  "Verdana",
  "Georgia",

  // Modern
  "Poppins",
  "Montserrat",
  "Roboto",

  // Elegant
  "Playfair Display",
  "Cinzel",
  "Cormorant Garamond",

  // Handwritten
  "Pacifico",
  "Dancing Script",
  "Great Vibes",

  // Bold
  "Bangers",
  "Anton",
  "Bebas Neue",

  // Cute / Rounded
  "Quicksand",
  "Comfortaa",

  // Luxury
  "DM Serif Display",

  // Monospace
  "Courier New"
];

function ClockFace({ options }) {
  const dialStyle = options?.dialStyle || 'Modern Numbers'
  const numberStyle = options?.numberStyle || 'Modern'
  const hands = options?.clockHands || 'Classic Silver'
  const numberColor = resolveNumberColor(options?.numberColor)
  const isOutline = numberStyle === 'Outline'

  const toRoman = (num) => {
    const romans = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
    const ints = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
    let n = Number(num)
    let res = ''
    for (let i=0;i<ints.length;i++) {
      while (n >= ints[i]) { res += romans[i]; n -= ints[i] }
    }
    return res
  }

  const renderNumber = (number) => {
    if (dialStyle === 'Minimal Marks') return '|' // handled elsewhere but keep
    if (numberStyle === 'Roman') return toRoman(number)
    if (numberStyle === 'Dots') return '•'
    return number
  }

  const numberStyleClass = `clock-number-style-${String(numberStyle).toLowerCase().replaceAll(' ', '-')}`

  const markStyle = (left, top) => ({
    left: `${left}%`,
    top: `${top}%`,
    color: isOutline ? 'transparent' : numberColor,
    WebkitTextStroke: isOutline ? `1.5px ${numberColor}` : undefined,
    textShadow: isOutline
      ? 'none'
      : '0 1px 2px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.55), 0 0 2px rgba(255,255,255,0.35)',
  })

  return (
    <div className={`clock-face ${hands.toLowerCase().replaceAll(' ', '-')}`}>
      {dialStyle !== 'No Numbers' &&
        clockNumbers.map(([number, left, top]) => (
          <span
            className={`${dialStyle === 'Minimal Marks' ? 'clock-mark minimal' : 'clock-mark'} ${numberStyleClass}`}
            key={number}
            style={markStyle(left, top)}
          >
            {dialStyle === 'Minimal Marks' ? '|' : renderNumber(number)}
          </span>
        ))}
      <span className="clock-hand hour-hand" />
      <span className="clock-hand minute-hand" />
      <span className="clock-hand second-hand" />
      <span className="clock-pin" />
    </div>
  )
}

function NumberColorModal({ open, selectedColor, onClose, onSelect }) {
  if (!open) return null

  return (
    <div className="number-style-modal-backdrop" onClick={onClose}>
      <div className="number-style-modal" onClick={(e) => e.stopPropagation()}>
        <div className="number-style-modal-header">
          <h3>Choose number color</h3>
          <button type="button" onClick={onClose} className="number-style-modal-close">×</button>
        </div>
        <p className="number-color-modal-hint">Pick a color so 1–12 stay visible on your photo.</p>
        <div className="number-color-modal-grid">
          {CLOCK_NUMBER_COLORS.map((entry) => {
            const selected = selectedColor === entry.value
            return (
              <button
                key={entry.value}
                type="button"
                title={entry.name}
                onClick={() => onSelect(entry.value)}
                className={`number-color-swatch ${selected ? 'is-selected' : ''}`}
                style={{ backgroundColor: entry.value }}
              >
                <span className="number-color-swatch__label">{entry.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function NumberStyleModal({ open, options, onClose, onSelect }) {
  if (!open) return null
  const styles = ['Modern', 'Outline', 'Script', 'Retro', 'Bold', 'Roman', 'Dots']

  return (
    <div className="number-style-modal-backdrop" onClick={onClose}>
      <div className="number-style-modal" onClick={(e) => e.stopPropagation()}>
        <div className="number-style-modal-header">
          <h3>Choose clock number style</h3>
          <button type="button" onClick={onClose} className="number-style-modal-close">×</button>
        </div>
        <div className="grid number-style-modal-grid">
          {styles.map((style) => {
            const selected = options?.numberStyle === style
            return (
              <button
                key={style}
                type="button"
                onClick={() => onSelect(style)}
                className={`number-style-thumb ${selected ? 'is-selected' : ''}`}
              >
                <div className={`number-sample number-sample-${String(style).toLowerCase().replaceAll(' ', '-')}`}>
                  <span>12</span>
                </div>
                <div className="number-style-label">{style}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const clampCrop = (v, min, max) => Math.min(max, Math.max(min, v))

/**
 * PhotoSlot — displays the uploaded photo and, when `draggable`, lets the
 * user reposition it inside the frame:
 *  - Pointer drag (mouse or touch) pans the photo
 *  - Mouse wheel zooms in/out; +/- buttons cover touch devices
 *  - A small corner button lets you swap the photo without losing crop
 */
function PhotoSlot({
  src,
  label,
  crop,
  onClick,
  onActivate,
  isActive = false,
  showLabel = true,
  draggable = false,
  onCropChange,
  clipPath,
}) {
  const containerRef = useRef(null)
  const dragRef = useRef(null)
  const effCrop = crop || { x: 0, y: 0, scale: 1, rotate: 0 }
  const hexSlot = isHexClipPath(clipPath)
  const shapedSlot = Boolean(clipPath)
  const imgScale = (effCrop.scale || 1) * (hexSlot ? HEX_PHOTO_FILL_SCALE : 1)

  const emitCrop = (patch) => onCropChange?.({ ...effCrop, ...patch })

  const handlePointerMove = (e) => {
    const ds = dragRef.current
    if (!ds) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const dxPct = (clientX - ds.startX) / ds.rectW
    const dyPct = (clientY - ds.startY) / ds.rectH
    emitCrop({
      x: clampCrop(ds.origX + dxPct * 5, -2.5, 2.5),
      y: clampCrop(ds.origY + dyPct * 5, -2.5, 2.5),
    })
  }

  const handlePointerUp = () => {
    dragRef.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    window.removeEventListener('touchmove', handlePointerMove)
    window.removeEventListener('touchend', handlePointerUp)
  }

  const handlePointerDown = (e) => {
    onActivate?.()
    if (!draggable || !src) return
    e.stopPropagation()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    dragRef.current = { startX: clientX, startY: clientY, origX: effCrop.x || 0, origY: effCrop.y || 0, rectW: rect.width, rectH: rect.height }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('touchmove', handlePointerMove, { passive: false })
    window.addEventListener('touchend', handlePointerUp)
  }

  const handleWheel = (e) => {
    if (!draggable || !src) return
    e.preventDefault()
    e.stopPropagation()
    emitCrop({ scale: clampCrop((effCrop.scale || 1) + (e.deltaY < 0 ? 0.1 : -0.1), 1, 3) })
  }

  const zoomBy = (delta) => emitCrop({ scale: clampCrop((effCrop.scale || 1) + delta, 1, 3) })
  const resetCrop = () => onCropChange?.({ x: 0, y: 0, scale: 1, rotate: effCrop.rotate || 0 })

  return (
    <div
      ref={containerRef}
      className={`preview-slot preview-slot--clip group relative ${shapedSlot ? 'preview-slot--shaped' : ''} ${isActive ? 'preview-slot--active' : ''}`}
      onClick={!draggable ? onClick : undefined}
      onPointerDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onWheel={handleWheel}
      style={{
        cursor: draggable && src ? 'grab' : onClick ? 'pointer' : 'default',
        width: '100%',
        height: '100%',
        touchAction: draggable && src ? 'none' : 'auto',
        ...(clipPath ? { clipPath, WebkitClipPath: clipPath } : {}),
      }}
    >
      {src ? (
        <>
          <div className="preview-slot__clip">
            <img
              src={src}
              alt={label}
              draggable={false}
              className="preview-slot__img h-full w-full min-h-full min-w-full select-none object-cover"
              style={{
                transform: `scale(${imgScale}) rotate(${effCrop.rotate || 0}deg)`,
                objectPosition: `${50 - (effCrop.x || 0) * 20}% ${50 - (effCrop.y || 0) * 20}%`,
                transformOrigin: 'center center',
              }}
            />
          </div>
          {draggable && (
            <>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                <div className="flex items-center gap-1 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white">
                  <FiMove size={12} /> Drag to reposition
                </div>
              </div>

              <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); zoomBy(-0.15) }}
                  title="Zoom out"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white hover:bg-black/80"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); zoomBy(0.15) }}
                  title="Zoom in"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white hover:bg-black/80"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); resetCrop() }}
                  title="Reset position"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <FiRotateCw size={11} />
                </button>
              </div>

              {onClick && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClick() }}
                  title="Change photo"
                  className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 opacity-100 shadow transition sm:opacity-0 sm:group-hover:opacity-100 hover:bg-white"
                >
                  <FiUpload size={12} />
                </button>
              )}
            </>
          )}
        </>
      ) : showLabel || onClick ? (
        <div
          className="preview-empty flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400"
          onClick={onClick}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
          {showLabel && (
            <>
              <FiImage size={20} />
              <span className="text-xs">{label}</span>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

function parseAspectDims(aspectRatio = '3 / 4', maxSize = 280) {
  const parts = String(aspectRatio).split('/').map((p) => Number(p.trim()))
  const rw = parts[0] || 3
  const rh = parts[1] || 4
  const ratio = rw / rh
  if (ratio >= 1) {
    return { W: maxSize, H: Math.round(maxSize / ratio) }
  }
  return { W: Math.round(maxSize * ratio), H: maxSize }
}

function getShapeRadius(shapeClass = '', borderRadius = 12) {
  if (shapeClass.includes('circle')) return '50%'
  if (shapeClass.includes('heart')) return '0'
  if (shapeClass.includes('leaf')) return '40% 40% 40% 8%'
  if (shapeClass.includes('clock-shape-square')) return `${Math.min(borderRadius || 16, 24)}px`
  return `${Math.min(borderRadius || 12, 20)}px`
}

function getPhotoBoxStyle(photoBox, canvas, shapeClass) {
  const cw = canvas?.width || 1000
  const ch = canvas?.height || 1000
  const pb = photoBox || { x: 0, y: 0, width: cw, height: ch, borderRadius: 0 }
  return {
    position: 'absolute',
    left: `${(pb.x / cw) * 100}%`,
    top: `${(pb.y / ch) * 100}%`,
    width: `${(pb.width / cw) * 100}%`,
    height: `${(pb.height / ch) * 100}%`,
    borderRadius: getShapeRadius(shapeClass, pb.borderRadius),
    overflow: 'hidden',
    transform: pb.rotate ? `rotate(${pb.rotate}deg)` : undefined,
  }
}

/**
 * View3DModal — 360° rotating preview matching the 2D frame type, finish shine, and thickness.
 */
function View3DModal({
  open,
  onClose,
  photoUrl,
  photoCrop,
  textItems,
  thicknessPx,
  frameColor,
  borderRadius,
  displayFrameUrl,
  finish,
  shapeClass = '',
  aspectRatio = '3 / 4',
  showClockDial = false,
  clockOptions = {},
  photoBox,
  canvas,
  productType = '',
  useFrameOverlay = false,
  slotPhotos = [],
  photoBoxesList = [],
  layoutBoxes = [],
  layoutCanvas,
  layoutFit,
  useCollageSlots = false,
  getPhotoSrc,
  getCropForSlot,
}) {
  const [rotation, setRotation] = useState(18)
  const [autoRotate, setAutoRotate] = useState(true)
  const dragState = useRef(null)
  const finishStyle = getFinishStyle(finish)

  useEffect(() => {
    if (!open || !autoRotate) return undefined
    let raf
    const spin = () => {
      setRotation((r) => (r + 0.35) % 360)
      raf = requestAnimationFrame(spin)
    }
    raf = requestAnimationFrame(spin)
    return () => cancelAnimationFrame(raf)
  }, [open, autoRotate])

  useEffect(() => {
    if (!open) {
      setAutoRotate(true)
      setRotation(18)
    }
  }, [open])

  const onPointerMove = (e) => {
    const ds = dragState.current
    if (!ds) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const dx = clientX - ds.startX
    setRotation((ds.startRotation - dx * 0.6 + 360) % 360)
  }
  const onPointerUp = () => {
    dragState.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('touchmove', onPointerMove)
    window.removeEventListener('touchend', onPointerUp)
  }
  const onPointerDown = (e) => {
    setAutoRotate(false)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    dragState.current = { startX: clientX, startRotation: rotation }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('touchmove', onPointerMove, { passive: false })
    window.addEventListener('touchend', onPointerUp)
  }

  if (!open) return null

  const depth = Math.max(thicknessPx || 12, 8)
  const { W, H } = parseAspectDims(aspectRatio, 280)
  const edgeColor = hexToRgba(frameColor || '#d8dade', finishStyle.edgeOpacity)
  const backColor = frameColor || '#f3f4f6'
  const radius = getShapeRadius(shapeClass, borderRadius)
  const faceClip = shapeClass.includes('heart') ? 'clip-path-heart' : undefined
  const isCircular = isCircularPreview(shapeClass, photoBox)
  const effectiveDepth = isCircular ? 6 : depth
  const isWatchProduct = productType === 'custom-wall-watch' || productType === 'photo-clock'
  const useLayeredFace = showClockDial || isWatchProduct || useFrameOverlay || Boolean(displayFrameUrl)
  const stageCanvas = layoutCanvas || canvas
  const photoAreaStyle = photoBoxToStyle(photoBox, stageCanvas, { fit: layoutFit })
  const subtitle = isWatchProduct || showClockDial
    ? 'Drag to rotate — watch matches your customization'
    : 'Drag to rotate — frame matches your customization'

  const renderPhotoInBox = (src, crop, boxStyle, key) => {
    const shapeClip = shapeClass.includes('heart') ? 'clip-path-heart' : undefined
    if (!src) {
      return (
        <div key={key} style={{ ...boxStyle, borderRadius: isCircular ? '50%' : boxStyle.borderRadius }} className={shapeClip}>
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            <FiImage size={24} />
          </div>
        </div>
      )
    }
    return (
      <div key={key} style={{ ...boxStyle, borderRadius: isCircular ? '50%' : boxStyle.borderRadius }} className={shapeClip}>
        <img
          src={src}
          alt="preview"
          className="h-full w-full object-cover"
          style={{
            transform: `scale(${crop?.scale || 1}) rotate(${crop?.rotate || 0}deg)`,
            objectPosition: `${50 - (crop?.x || 0) * 20}% ${50 - (crop?.y || 0) * 20}%`,
          }}
        />
      </div>
    )
  }

  const renderFaceContent = () => {
    if (useLayeredFace) {
      const stageCanvas = layoutCanvas || canvas
      const boxStyleOpts = { fit: layoutFit, transparent: useFrameOverlay }
      const collageSlots =
        useCollageSlots && (layoutBoxes?.length || photoBoxesList?.length)
          ? layoutBoxes?.length
            ? layoutBoxes
            : photoBoxesList
          : null

      const resolveSlotPhoto = (index) => getPhotoSrc?.(index) || slotPhotos[index]?.url

      return (
        <>
          {collageSlots
            ? collageSlots.map((pb, index) =>
                renderPhotoInBox(
                  resolveSlotPhoto(index),
                  getCropForSlot?.(index) || photoCrop,
                  photoBoxToStyle(pb, stageCanvas, boxStyleOpts),
                  `slot-${index}`,
                ),
              )
            : renderPhotoInBox(photoUrl, photoCrop, photoAreaStyle, 'main-photo')}

          {displayFrameUrl ? (
            <img
              src={displayFrameUrl}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[5] h-full w-full object-contain"
              style={isCircular ? { borderRadius: '50%' } : undefined}
            />
          ) : null}

          {showClockDial ? (
            <div
              className={shapeClass}
              style={
                collageSlots
                  ? { position: 'absolute', inset: 0, overflow: 'visible', background: 'transparent', zIndex: 10 }
                  : { ...photoAreaStyle, overflow: 'visible', background: 'transparent', zIndex: 10 }
              }
            >
              <ClockFace options={clockOptions} />
            </div>
          ) : null}

          {textItems?.map((item) => (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                color: item.color,
                fontFamily: item.font,
                fontSize: Math.max(item.fontSize * 0.55, 10),
                fontWeight: 700,
                whiteSpace: 'nowrap',
                zIndex: 6,
              }}
            >
              {item.value}
            </div>
          ))}

          {finishStyle.shine !== 'none' && !collageSlots ? (
            <div
              className="pointer-events-none absolute inset-0 z-[7]"
              style={{ background: finishStyle.shine, borderRadius: isCircular ? '50%' : radius }}
            />
          ) : null}
        </>
      )
    }

    return (
      <>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="preview"
            className="h-full w-full object-cover"
            style={{
              transform: `scale(${photoCrop?.scale || 1}) rotate(${photoCrop?.rotate || 0}deg)`,
              objectPosition: `${50 - (photoCrop?.x || 0) * 20}% ${50 - (photoCrop?.y || 0) * 20}%`,
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <FiImage size={28} />
          </div>
        )}
        {textItems?.map((item) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
              color: item.color,
              fontFamily: item.font,
              fontSize: Math.max(item.fontSize * 0.55, 10),
              fontWeight: 700,
              whiteSpace: 'nowrap',
              zIndex: 2,
            }}
          >
            {item.value}
          </div>
        ))}
        {displayFrameUrl ? (
          <img
            src={displayFrameUrl}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[3] h-full w-full object-contain"
          />
        ) : null}
        {finishStyle.shine !== 'none' && (
          <div
            className="pointer-events-none absolute inset-0 z-[4]"
            style={{ background: finishStyle.shine, borderRadius: radius }}
          />
        )}
      </>
    )
  }

  const faceStyle = {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: isCircular ? 'visible' : 'hidden',
    transform: `translateZ(${effectiveDepth / 2}px)`,
    overflow: 'hidden',
    borderRadius: isCircular ? '50%' : radius,
    background: useCollageSlots && isWatchProduct ? frameColor || '#111111' : '#f3f4f6',
    boxShadow: isCircular
      ? `${finishStyle.shadow}, 0 4px 14px rgba(0,0,0,0.18), 0 0 0 3px ${edgeColor}`
      : `${finishStyle.shadow}, 0 10px 28px rgba(0,0,0,0.24)`,
  }

  const rotatorSize = isCircular ? Math.min(W, H) : W
  const rotatorHeight = isCircular ? Math.min(W, H) : H
  const tiltX = isCircular ? 8 : 14

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm px-3 py-4 sm:px-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 sm:right-4 sm:top-4"
        >
          <FiX size={18} />
        </button>

        <div className="mb-1 pt-2 text-center text-base font-bold text-gray-900 sm:text-lg">360° 3D Preview</div>
        <div className="mb-4 text-center text-xs text-gray-400">{subtitle}</div>

        <div
          style={{ perspective: 1400, minHeight: rotatorHeight + 48 }}
          className="flex items-center justify-center py-4 select-none sm:py-8"
        >
          <div
            onPointerDown={onPointerDown}
            onTouchStart={onPointerDown}
            style={{
              width: rotatorSize,
              height: rotatorHeight,
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: `rotateY(${rotation}deg) rotateX(${tiltX}deg)`,
              cursor: 'grab',
              touchAction: 'none',
            }}
          >
            {/* Front face */}
            <div style={faceStyle} className={faceClip || undefined}>
              {renderFaceContent()}
            </div>

            {/* Back face */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: `translateZ(-${effectiveDepth / 2}px) rotateY(180deg)`,
                background: backColor,
                borderRadius: isCircular ? '50%' : radius,
                backfaceVisibility: isCircular ? 'visible' : 'hidden',
              }}
              className={faceClip || undefined}
            />

            {/* Edge faces — rectangular products only */}
            {!isCircular ? (
              <>
            <div
              style={{
                position: 'absolute', left: 0, top: 0, width: effectiveDepth, height: rotatorHeight,
                transform: `rotateY(-90deg) translateZ(${effectiveDepth / 2}px)`,
                background: edgeColor,
              }}
            />
            <div
              style={{
                position: 'absolute', right: 0, top: 0, width: effectiveDepth, height: rotatorHeight,
                transform: `rotateY(90deg) translateZ(${effectiveDepth / 2}px)`,
                background: edgeColor,
              }}
            />
            <div
              style={{
                position: 'absolute', left: 0, top: 0, width: rotatorSize, height: effectiveDepth,
                transform: `rotateX(90deg) translateZ(${effectiveDepth / 2}px)`,
                background: edgeColor,
                boxShadow: finishStyle.key === 'glossy' ? 'inset 0 2px 6px rgba(255,255,255,0.35)' : undefined,
              }}
            />
            <div
              style={{
                position: 'absolute', left: 0, bottom: 0, width: rotatorSize, height: effectiveDepth,
                transform: `rotateX(-90deg) translateZ(${effectiveDepth / 2}px)`,
                background: edgeColor,
              }}
            />
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            {autoRotate ? <FiPause size={14} /> : <FiPlay size={14} />}
            {autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
          </button>
          <button
            type="button"
            onClick={() => setRotation(18)}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-900"
          >
            <FiRotateCw size={14} /> Reset
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * PreviewFrame — full interactive product customizer preview.
 *
 * Includes:
 * - Select Photo (toolbar + big CTA)
 * - Drag-to-reposition photo inside the frame, with wheel/button zoom (per slot)
 * - Working draggable / rotatable text layer with edit panel (color, font, save, delete)
 * - Size selector -> live aspect ratio change
 * - Orientation (Portrait / Landscape / Square) -> frame reshapes live
 * - Thickness selector -> frame border grows/shrinks live
 * - 360° 3D View popup (drag or auto-rotate, real thickness visible)
 */
export function PreviewFrame({
  product,
  variant,
  photoUrl,
  crop,
  text = {},
  options = {},
  slotPhotos = [],
  activeSlot = 0,
  onPhotoSelect,
  onCropChange,
  onSlotActivate,
  onPreviewChange,
  onOptionsChange,
  onOptionChange,
  frameColors = DEFAULT_FRAME_COLORS,
  sizeOptions = DEFAULT_SIZES,
  thicknessOptions = DEFAULT_THICKNESS,
  compact = false,
  minimal = false,
}) {
  const emitOptionChange = onOptionsChange || onOptionChange
  const collageMockup = resolveCollageMockup(product, variant, options)
  const liveBaseImage = getProductBaseImage(product)
  const useLiveProductImage = usesLiveProductImage(product)
  const allowPhotoUpload = product?.personalization?.allowPhotoUpload !== false
  const photoBoxesList = resolvePreviewPhotoBoxes(product, variant, options)
  const canvas = collageMockup?.canvas || product?.mockup?.canvas || { width: 1000, height: 1000 }
  const box = photoBoxesList?.[0] || product?.mockup?.photoBox || { x: 120, y: 120, width: 760, height: 760, borderRadius: 20 }
  const rawFrameImage = useLiveProductImage
    ? null
    : resolveMediaUrl(collageMockup?.frameImage || getProductFrameImage(product, variant, options))
  const useFrameOverlay =
    Boolean(rawFrameImage) && wallWatchShouldUseSvgFrame(product, options, variant, rawFrameImage)
  const frameImage = useFrameOverlay ? rawFrameImage : null
  const useCollageSlots = Boolean(photoBoxesList?.length > 1)
  const photosUnderFrame = useFrameOverlay
  const photoLayerZ = photosUnderFrame ? 2 : 8
  const frameLayerZ = photosUnderFrame ? 30 : 10
  const dialLayerZ = photosUnderFrame || useFrameOverlay ? 35 : 18
  const finishStyle = useMemo(() => getFinishStyle(options.finish), [options.finish])
  const frameStyleHint = getFrameStyleHint(options.frameStyle || variant?.frameType || '')
  const slotLayout = getSlotLayout(options, product?.productType)
  const showClockDial = shouldShowClockDial(product)
  const shapeClass = showClockDial
    ? getClockShapeClass(
        options.shape || product?.defaultOptions?.shape || variant?.frameType,
        options.frameStyle || variant?.frameType,
        variant?.frameType,
      )
    : isCircularPhotoBox(box)
      ? 'clock-shape-circle'
      : ''

  const stageRef = useRef(null)
  const [processedFrameUrl, setProcessedFrameUrl] = useState('')
  const [mockupLayout, setMockupLayout] = useState({
    canvas,
    photoBoxes: photoBoxesList || (box?.width ? [box] : []),
  })

  const sourcePhotoBoxes = useMemo(
    () => (photoBoxesList?.length ? photoBoxesList : box?.width ? [box] : []),
    [photoBoxesList, box?.x, box?.y, box?.width, box?.height, box?.borderRadius, box?.rotate],
  )

  useEffect(() => {
    let cancelled = false
    if (!frameImage || !useFrameOverlay) {
      resolveMockupLayout(null, canvas, sourcePhotoBoxes).then((layout) => {
        if (!cancelled) setMockupLayout(layout)
      })
      return () => {
        cancelled = true
      }
    }
    resolveMockupLayout(frameImage, canvas, sourcePhotoBoxes).then((layout) => {
      if (!cancelled) setMockupLayout(layout)
    })
    return () => {
      cancelled = true
    }
  }, [frameImage, canvas.width, canvas.height, useFrameOverlay, sourcePhotoBoxes, canvas])

  const layoutCanvas = mockupLayout.canvas || canvas
  const layoutBoxes =
    mockupLayout.photoBoxes?.length > 0
      ? mockupLayout.photoBoxes
      : photoBoxesList?.length
        ? photoBoxesList
        : box?.width
          ? [box]
          : []
  const layoutBox = layoutBoxes[0] || box

  const [clippedLayoutBoxes, setClippedLayoutBoxes] = useState(null)

  useEffect(() => {
    if (!frameImage || !photosUnderFrame || !layoutBoxes.length || useCollageSlots) {
      setClippedLayoutBoxes(null)
      return undefined
    }
    if (layoutBoxes.every((entry) => entry.clipPath)) {
      setClippedLayoutBoxes(null)
      return undefined
    }

    let cancelled = false
    inferSlotClipPathsFromFrame(frameImage, layoutBoxes, layoutCanvas)
      .then((enhanced) => {
        if (!cancelled) setClippedLayoutBoxes(enhanced)
      })
      .catch(() => {
        if (!cancelled) setClippedLayoutBoxes(null)
      })

    return () => {
      cancelled = true
    }
  }, [frameImage, photosUnderFrame, layoutBoxes, layoutCanvas.width, layoutCanvas.height])

  const effectiveLayoutBoxes = clippedLayoutBoxes || layoutBoxes
  const effectiveLayoutBox = effectiveLayoutBoxes[0] || layoutBox

  useEffect(() => {
    if (!frameImage) {
      setProcessedFrameUrl('')
      return undefined
    }
    const needsPunch = useCollageSlots && layoutBoxes?.length && shouldPunchFrameHoles(frameImage)
    if (!needsPunch) {
      setProcessedFrameUrl(frameImage)
      return undefined
    }

    let cancelled = false
    punchFrameHoles(frameImage, layoutBoxes, layoutCanvas)
      .then((url) => {
        if (!cancelled) setProcessedFrameUrl(url)
      })
      .catch(() => {
        if (!cancelled) setProcessedFrameUrl(frameImage)
      })

    return () => {
      cancelled = true
    }
  }, [frameImage, layoutBoxes, layoutCanvas.width, layoutCanvas.height, useCollageSlots])

  const displayFrameUrl = processedFrameUrl || frameImage

  // ---- Photo upload ----
  const [localPreviews, setLocalPreviews] = useState({}) // NEW: per-slot fallback { 0: url, 1: url, 2: url... }
  const photos = slotPhotos.length ? slotPhotos : photoUrl || localPreviews[0] ? [{ url: photoUrl || localPreviews[0] }] : []
  const getPhotoSrc = (index) =>
    slotPhotos.length ? slotPhotos[index]?.url : index === 0 ? photoUrl || localPreviews[0] : localPreviews[index] // NEW
  const hasPhoto = photos.length > 0 && photos[0]?.url
  const inputRef = useRef(null)
  const activeSlotIndex = useRef(0)

  const openFilePicker = (slotIndex = 0) => {
    onSlotActivate?.(slotIndex)
    if (useCollageSlots && slotIndex === 0) {
      const firstEmpty = layoutBoxes.findIndex((_, i) => !getPhotoSrc(i))
      activeSlotIndex.current = firstEmpty >= 0 ? firstEmpty : slotIndex
    } else {
      activeSlotIndex.current = slotIndex
    }
    inputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (onPhotoSelect) onPhotoSelect(file, activeSlotIndex.current)
    else setLocalPreviews((prev) => ({ ...prev, [activeSlotIndex.current]: URL.createObjectURL(file) })) // NEW: per-slot
    e.target.value = ''
  }

  // ---- Drag-to-reposition / zoom crop state (per photo slot) ----
  const isCropControlled = Boolean(onCropChange)
  const [cropState, setCropState] = useState({})
  const defaultCrop = { x: 0, y: 0, scale: 1, rotate: 0 }

  const getCrop = (index) => {
    const slotCrop = photos[index]?.crop
    if (slotCrop) {
      return { ...defaultCrop, ...slotCrop }
    }
    if (isCropControlled && index === 0 && crop) {
      return { ...defaultCrop, ...crop }
    }
    return {
      ...defaultCrop,
      ...(cropState[index] || {}),
    }
  }

  const activateSlot = (index) => {
    activeSlotIndex.current = index
    onSlotActivate?.(index)
  }

  const setCropForSlot = (index, nextCrop) => {
    if (isCropControlled) {
      onCropChange?.(nextCrop, index)
      return
    }
    setCropState((prev) => ({ ...prev, [index]: nextCrop }))
    onCropChange?.(nextCrop, index)
  }

  // ---- Size / orientation / thickness ----
  const materialThickness = parseMaterialThickness(variant?.material, options.material)
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0])
  const [orientation, setOrientation] = useState('portrait')
  const [thickness, setThickness] = useState(materialThickness)

  useEffect(() => {
    setThickness(materialThickness)
  }, [variant?.material, options?.material])

  const getEffectiveDims = () => {
    const short = Math.min(selectedSize.w, selectedSize.h)
    const long = Math.max(selectedSize.w, selectedSize.h)
    if (orientation === 'landscape') return { w: long, h: short }
    if (orientation === 'square') return { w: short, h: short }
    return { w: short, h: long } // portrait
  }
  const effDims = getEffectiveDims()
  const isWallClockProduct =
    product?.productType === 'custom-wall-watch' || product?.productType === 'photo-clock'
  const layoutFit = mockupLayout.fit
  const boxStyleOptions = { transparent: photosUnderFrame, fit: layoutFit }

  const isPortraitCollage = useCollageSlots && layoutCanvas.height > layoutCanvas.width * 1.05 && !showClockDial
  const useCanvasAspect =
    useFrameOverlay || useLiveProductImage || isWallClockProduct || showClockDial
  const aspect = useCanvasAspect
    ? `${layoutCanvas.width} / ${layoutCanvas.height}`
    : `${effDims.w} / ${effDims.h}`
  const stageMaxWidth = minimal
    ? '100%'
    : isPortraitCollage
      ? 'min(100%, 380px)'
      : useCanvasAspect
        ? 'min(100%, 480px)'
        : 'min(100%, 420px)'

  const photoBoxStyle = photoBoxToStyle(effectiveLayoutBox, layoutCanvas, boxStyleOptions)

  const dialLayerStyle =
    useCollageSlots && showClockDial
      ? layoutFit &&
          !(layoutFit.left === 0 && layoutFit.top === 0 && layoutFit.width === 100 && layoutFit.height === 100)
        ? {
            position: 'absolute',
            left: `${layoutFit.left}%`,
            top: `${layoutFit.top}%`,
            width: `${layoutFit.width}%`,
            height: `${layoutFit.height}%`,
            overflow: 'visible',
            background: 'transparent',
          }
        : { position: 'absolute', inset: 0, overflow: 'visible', background: 'transparent' }
      : { ...photoBoxStyle, overflow: 'visible', background: 'transparent' }

  // ---- Frame colour ----
  const [activeColor, setActiveColor] = useState(frameColors[0])

  // ---- 3D view popup ----
  const [show3D, setShow3D] = useState(false)
  const [showNumberStyleModal, setShowNumberStyleModal] = useState(false)
  const [showNumberColorModal, setShowNumberColorModal] = useState(false)
  const [localNumberStyle, setLocalNumberStyle] = useState(options?.numberStyle || 'Modern')
  const [localNumberColor, setLocalNumberColor] = useState(() => resolveNumberColor(options?.numberColor))

  useEffect(() => {
    setLocalNumberStyle(options?.numberStyle || 'Modern')
  }, [options?.numberStyle])

  useEffect(() => {
    setLocalNumberColor(resolveNumberColor(options?.numberColor))
  }, [options?.numberColor])

  const clockFaceOptions = useMemo(
    () => ({ ...options, numberStyle: localNumberStyle, numberColor: localNumberColor }),
    [options, localNumberStyle, localNumberColor],
  )

  // ---- Text layer ----
  const [textItems, setTextItems] = useState(() =>
    Object.values(text)
      .filter(Boolean)
      .map((value, i) => ({ id: `t${i}`, value, x: 50, y: 80, rotation: 0, color: '#000000', font: FONT_STYLES[0], fontSize: 22 }))
  )
  const [editingId, setEditingId] = useState(null)
  const dragState = useRef(null) // { id, mode: 'move' | 'rotate', ... }

  const addTextItem = () => {
    const id = `t${Date.now()}`
    setTextItems((prev) => [...prev, { id, value: 'Edit Text', x: 50, y: 20, rotation: 0, color: '#000000', font: FONT_STYLES[0], fontSize: 22 }])
    setEditingId(id)
  }

  const updateItem = (id, patch) => setTextItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  const removeItem = (id) => {
    setTextItems((prev) => prev.filter((it) => it.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const getStageRect = () => stageRef.current?.getBoundingClientRect()

  const onPointerDownMove = (e, item) => {
    e.stopPropagation()
    setEditingId(item.id)
    const rect = getStageRect()
    if (!rect) return
    dragState.current = { id: item.id, mode: 'move', rect, origX: item.x, origY: item.y, startClientX: e.clientX, startClientY: e.clientY }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUpGlobal)
  }

  const onPointerDownRotate = (e, item) => {
    e.stopPropagation()
    const rect = getStageRect()
    if (!rect) return
    const centerX = rect.left + (item.x / 100) * rect.width
    const centerY = rect.top + (item.y / 100) * rect.height
    dragState.current = { id: item.id, mode: 'rotate', centerX, centerY, origRotation: item.rotation }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUpGlobal)
  }

  const onPointerMove = (e) => {
    const ds = dragState.current
    if (!ds) return
    if (ds.mode === 'move') {
      const dxPct = ((e.clientX - ds.startClientX) / ds.rect.width) * 100
      const dyPct = ((e.clientY - ds.startClientY) / ds.rect.height) * 100
      const newX = Math.min(95, Math.max(5, ds.origX + dxPct))
      const newY = Math.min(95, Math.max(5, ds.origY + dyPct))
      updateItem(ds.id, { x: newX, y: newY })
    } else if (ds.mode === 'rotate') {
      const angle = Math.atan2(e.clientY - ds.centerY, e.clientX - ds.centerX) * (180 / Math.PI)
      updateItem(ds.id, { rotation: Math.round(angle + 90) })
    }
  }

  const onPointerUpGlobal = () => {
    dragState.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUpGlobal)
  }

  const editingItem = textItems.find((it) => it.id === editingId)
  const activePhotoUrl = getPhotoSrc(0) || photos[0]?.url

  useEffect(() => {
    onPreviewChange?.({
      frameColor: activeColor?.value,
      frameColorName: activeColor?.name,
      thickness: thickness.label,
      thicknessPx: thickness.px,
      orientation,
      size: selectedSize.label,
      textItems,
    })
  }, [activeColor, thickness, orientation, selectedSize, textItems, onPreviewChange])

  const stageShadow =
    frameStyleHint === 'floating'
      ? `${finishStyle.shadow}, 0 16px 32px rgba(0,0,0,0.12)`
      : finishStyle.shadow

  return (
    <div className="w-full max-w-full">
      {/* ---------- Toolbar ---------- */}
      {!compact && (
        <div className="mb-4 flex flex-nowrap items-center gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm scrollbar-hide sm:flex-wrap sm:gap-3 sm:px-4 sm:py-3">
          {allowPhotoUpload && (
            <button
              type="button"
              onClick={() => openFilePicker(0)}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-red-700 sm:px-4 sm:text-sm"
            >
              <FiUpload /> {useCollageSlots ? 'Upload Photos' : 'Select Photo'}
            </button>
          )}

          {showClockDial && (
            <>
              <button
                type="button"
                onClick={() => setShowNumberStyleModal(true)}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-gray-900 hover:bg-gray-50 sm:text-sm"
                title="Number style"
              >
                <span className="preview-toolbar-number-icon">12</span>
                Number Style
              </button>
              <button
                type="button"
                onClick={() => setShowNumberColorModal(true)}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-gray-900 hover:bg-gray-50 sm:text-sm"
                title="Number color"
              >
                <span
                  className="preview-toolbar-color-dot"
                  style={{ backgroundColor: localNumberColor }}
                />
                Number Color
              </button>
            </>
          )}

          {product?.personalization?.allowText !== false && (
            <button
              type="button"
              onClick={addTextItem}
              title="Add text"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:border-red-500 hover:text-red-600"
            >
              <FiType />
            </button>
          )}

          {!useLiveProductImage && (
            <>
              <div className="mx-1 h-6 w-px bg-gray-200" />

              <div className="flex items-center gap-2">
                {frameColors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    title={color.name}
                    onClick={() => setActiveColor(color)}
                    className="h-7 w-7 rounded-md transition"
                    style={{
                      backgroundColor: color.value,
                      border: `2px solid ${color.border}`,
                      boxShadow: activeColor?.name === color.name ? '0 0 0 2px #1d3fd6' : 'none',
                    }}
                  />
                ))}
              </div>
            </>
          )}

          <div className="mx-1 h-6 w-px bg-gray-200" />

          <button
            type="button"
            onClick={() => setShow3D(true)}
            className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white"
          >
            <FiBox /> View in 3D
          </button>
        </div>
      )}

      {/* ---------- Size / Orientation / Thickness — hidden when using a fixed frame image ---------- */}
      {!compact && !useFrameOverlay && !useLiveProductImage && (
        <div className="mb-4 space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-700">Size (Inch)</div>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    selectedSize.label === s.label ? 'bg-red-600 text-white' : 'border border-gray-300 text-gray-700 hover:border-red-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-gray-700">Orientation</div>
            <div className="flex flex-wrap gap-2">
              {['portrait', 'landscape', 'square'].map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOrientation(o)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition ${
                    orientation === o ? 'bg-red-600 text-white' : 'border border-gray-300 text-gray-700 hover:border-red-400'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-gray-700">Thickness (mm)</div>
            <div className="flex flex-wrap gap-2">
              {thicknessOptions.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setThickness(t)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    thickness.label === t.label ? 'bg-red-600 text-white' : 'border border-gray-300 text-gray-700 hover:border-red-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- Flat editing stage (2D — drag photo/text here) ---------- */}
      <div style={{ perspective: 1400 }} className={`flex w-full items-center justify-center rounded-2xl bg-gray-100 ${minimal ? 'p-1' : 'p-3 sm:p-6'}`}>
        <div
          ref={stageRef}
          onPointerDown={() => setEditingId(null)}
          style={{
            aspectRatio: aspect,
            width: showClockDial ? stageMaxWidth : '100%',
            maxWidth: stageMaxWidth,
            maxHeight: showClockDial ? stageMaxWidth : isPortraitCollage ? 'min(72vh, 720px)' : undefined,
            margin: showClockDial || isPortraitCollage ? '0 auto' : undefined,
            flexShrink: showClockDial ? 0 : undefined,
            position: 'relative',
            boxShadow: useFrameOverlay ? stageShadow : stageShadow || '0 4px 12px rgba(0,0,0,0.08)',
            borderRadius: useFrameOverlay ? 0 : showClockDial ? 16 : box.borderRadius ? `${Math.min(box.borderRadius, 24)}px` : 12,
            overflow: showClockDial ? 'visible' : 'hidden',
            background: useFrameOverlay || useLiveProductImage ? 'transparent' : showClockDial ? '#f3f4f6' : undefined,
          }}
          className={showClockDial ? 'clock-preview-shell' : ''}
        >
          {/* Finish shine — not on collage frame overlay */}
          {finishStyle.shine !== 'none' && !useCollageSlots && (
            <div
              className="pointer-events-none absolute inset-0 z-[12]"
              style={{ background: finishStyle.shine }}
            />
          )}
          {/* CSS border frame — wall-art style products without shaped clock dial */}
          {!useFrameOverlay && !useLiveProductImage && !showClockDial && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: '#e5e7eb',
                border: `${thickness.px}px solid ${activeColor?.value || '#ffffff'}`,
                boxSizing: 'border-box',
                transition: 'border-width 0.3s ease',
              }}
            />
          )}

          {/* Acrylic bezel for shaped wall clocks (heart, star, hex, etc.) */}
          {showClockDial && shapeClass && !useFrameOverlay && (
            <div
              className={`pointer-events-none absolute clock-acrylic-bezel ${shapeClass}`}
              style={{
                ...(useCollageSlots ? dialLayerStyle : photoBoxStyle),
                zIndex: 14,
                ['--clock-frame-color']: activeColor?.value || '#ffffff',
                ['--clock-frame-width']: `${Math.max(thickness.px, 10)}px`,
              }}
              aria-hidden
            />
          )}

          {/* Live product photo — name plates use real image, not SVG mockup */}
          {useLiveProductImage && liveBaseImage && (
            <img
              src={resolveMediaUrl(liveBaseImage)}
              alt={product?.title || 'Product'}
              className="pointer-events-none absolute inset-0 z-[1] h-full w-full select-none object-contain"
            />
          )}

          {/* Photo slots — aligned to frame transparent windows */}
          {(!useLiveProductImage || allowPhotoUpload) && (useCollageSlots ? (
            effectiveLayoutBoxes.map((pb, index) => {
              const pbStyle = photoBoxToStyle(pb, layoutCanvas, boxStyleOptions)
              return (
                <div
                  key={pb.id ?? index}
                  className={`preview-photo-box ${photosUnderFrame ? 'preview-photo-box--under-frame' : ''}`}
                  style={{ ...pbStyle, zIndex: photoLayerZ }}
                >
                  <PhotoSlot
                    src={getPhotoSrc(index)}
                    crop={getCrop(index)}
                    clipPath={pb.clipPath}
                    label={`Photo ${index + 1}`}
                    showLabel={!getPhotoSrc(index) && !photosUnderFrame}
                    draggable={!!getPhotoSrc(index)}
                    isActive={activeSlot === index}
                    onActivate={() => activateSlot(index)}
                    onCropChange={(next) => setCropForSlot(index, next)}
                    onClick={() => openFilePicker(index)}
                  />
                </div>
              )
            })
          ) : (
          <div
            className={`preview-photo-box ${shapeClass} ${photosUnderFrame ? 'preview-photo-box--under-frame' : ''}`}
            style={{ ...photoBoxStyle, zIndex: photoLayerZ }}
          >
            {slotLayout === 'single' ? (
              <PhotoSlot
                src={photos[0]?.url}
                crop={getCrop(0)}
                clipPath={effectiveLayoutBox?.clipPath}
                label="Upload Photo"
                showLabel={!useFrameOverlay && !showClockDial}
                draggable={hasPhoto}
                isActive={activeSlot === 0}
                onActivate={() => activateSlot(0)}
                onCropChange={(next) => setCropForSlot(0, next)}
                onClick={() => openFilePicker(0)}
              />
            ) : slotLayout === 'clock-collage' || slotLayout === 'frame-collage' ? (
              <div className={`preview-slots ${slotLayout} h-full w-full`}>
                {Array.from({ length: Math.min(Math.max(photos.length, 4), 9) }).map((_, index) => (
                  <PhotoSlot
                    key={index}
                    src={photos[index]?.url}
                    crop={getCrop(index)}
                    label={`Photo ${index + 1}`}
                    draggable={!!photos[index]?.url}
                    isActive={activeSlot === index}
                    onActivate={() => activateSlot(index)}
                    onCropChange={(next) => setCropForSlot(index, next)}
                    onClick={() => openFilePicker(index)}
                  />
                ))}
              </div>
            ) : (
              <div className={`preview-slots ${slotLayout} h-full w-full`}>
                {Array.from({ length: Math.max(photos.length, 1) }).map((_, index) => (
                  <PhotoSlot
                    key={index}
                    src={photos[index]?.url}
                    crop={getCrop(index)}
                    label={`Photo ${index + 1}`}
                    draggable={!!photos[index]?.url}
                    isActive={activeSlot === index}
                    onActivate={() => activateSlot(index)}
                    onCropChange={(next) => setCropForSlot(index, next)}
                    onClick={() => openFilePicker(index)}
                  />
                ))}
              </div>
            )}
          </div>
          ))}

          {/* Frame overlay (PNG/SVG) — sits on top, photo shows through transparent window */}
          {useFrameOverlay && displayFrameUrl && (
            <img
              src={displayFrameUrl}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
              style={{
                zIndex: frameLayerZ,
                objectPosition: 'center',
              }}
            />
          )}

          {/* Clock hands/numbers — dial layer is NOT shape-clipped so 1–12 stay visible */}
          {showClockDial && (
            <div
              className="pointer-events-none absolute clock-dial-layer"
              style={{ ...dialLayerStyle, zIndex: dialLayerZ }}
            >
              <ClockFace options={clockFaceOptions} />
            </div>
          )}

          {/* Text layer — draggable / rotatable */}
          {textItems.map((item) => {
            const isEditing = editingId === item.id
            return (
              <div
                key={item.id}
                onPointerDown={(e) => onPointerDownMove(e, item)}
                style={{
                  position: 'absolute',
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                  zIndex: 30,
                  cursor: 'move',
                  userSelect: 'none',
                }}
              >
                {isEditing && (
                  <button
                    type="button"
                    onPointerDown={(e) => onPointerDownRotate(e, item)}
                    title="Drag to rotate"
                    className="absolute -top-9 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-blue-500 text-white shadow-md"
                    style={{ cursor: 'grab' }}
                  >
                    <FiRotateCw size={14} />
                  </button>
                )}

                <div
                  style={{
                    padding: '4px 10px',
                    border: isEditing ? '2px dashed #3b82f6' : '2px dashed transparent',
                    color: item.color,
                    fontFamily: item.font,
                    fontSize: item.fontSize,
                    whiteSpace: 'nowrap',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  {item.value || 'Text'}
                </div>

                {isEditing && (
                  <>
                    <span className="absolute -left-1 -top-1 h-2 w-2 border border-blue-500 bg-white" />
                    <span className="absolute -right-1 -top-1 h-2 w-2 border border-blue-500 bg-white" />
                    <span className="absolute -bottom-1 -left-1 h-2 w-2 border border-blue-500 bg-white" />
                    <span className="absolute -bottom-1 -right-1 h-2 w-2 border border-blue-500 bg-white" />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ---------- Text edit panel ---------- */}
      {!minimal && editingItem && (
        <div className="mt-3 rounded-2xl border-2 border-blue-400 bg-white p-3 shadow-lg sm:p-4">
          <div className="mb-1 flex items-center justify-center gap-1 text-gray-300">
            <FiMove size={14} />
          </div>

          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              autoFocus
              value={editingItem.value}
              onChange={(e) => updateItem(editingItem.id, { value: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black sm:flex-none"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => removeItem(editingItem.id)}
                title="Delete"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Text Color</div>
            <div className="flex flex-wrap gap-2">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateItem(editingItem.id, { color: c })}
                  className="h-7 w-7 rounded-md border border-gray-300 transition"
                  style={{
                    backgroundColor: c,
                    boxShadow: editingItem.color === c ? '0 0 0 2px #3b82f6' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Font Style</div>
            <select
              value={editingItem.font}
              onChange={(e) => updateItem(editingItem.id, { font: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              style={{ fontFamily: editingItem.font }}
            >
              {FONT_STYLES.map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* ---------- 360° 3D View popup ---------- */}
      <View3DModal
        open={show3D}
        onClose={() => setShow3D(false)}
        photoUrl={activePhotoUrl}
        photoCrop={getCrop(0)}
        textItems={textItems}
        thicknessPx={thickness.px}
        frameColor={activeColor?.value}
        borderRadius={effectiveLayoutBox.borderRadius}
        displayFrameUrl={displayFrameUrl ? resolveMediaUrl(displayFrameUrl) : null}
        finish={options.finish}
        shapeClass={shapeClass}
        aspectRatio={aspect}
        showClockDial={showClockDial}
        clockOptions={clockFaceOptions}
        photoBox={effectiveLayoutBox}
        canvas={layoutCanvas}
        productType={product?.productType}
        useFrameOverlay={useFrameOverlay}
        slotPhotos={slotPhotos.length ? slotPhotos : photos}
        photoBoxesList={photoBoxesList}
        layoutBoxes={effectiveLayoutBoxes}
        layoutCanvas={layoutCanvas}
        layoutFit={layoutFit}
        useCollageSlots={useCollageSlots}
        getPhotoSrc={getPhotoSrc}
        getCropForSlot={getCrop}
      />
      <NumberStyleModal
        open={showNumberStyleModal}
        options={clockFaceOptions}
        onClose={() => setShowNumberStyleModal(false)}
        onSelect={(style) => {
          setLocalNumberStyle(style)
          setShowNumberStyleModal(false)
          emitOptionChange?.('numberStyle', style)
        }}
      />
      <NumberColorModal
        open={showNumberColorModal}
        selectedColor={localNumberColor}
        onClose={() => setShowNumberColorModal(false)}
        onSelect={(color) => {
          setLocalNumberColor(color)
          setShowNumberColorModal(false)
          const named = CLOCK_NUMBER_COLORS.find((entry) => entry.value === color)?.name || color
          emitOptionChange?.('numberColor', named)
        }}
      />
    </div>
  )
}