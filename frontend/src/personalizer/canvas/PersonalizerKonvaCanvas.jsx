import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Group, Rect, Text, Transformer } from 'react-konva'
import { resolveMediaUrl } from '../../utils/mediaUrl'

function useKonvaImage(url) {
  const [image, setImage] = useState(null)
  useEffect(() => {
    if (!url) {
      setImage(null)
      return
    }
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setImage(img)
    img.onerror = () => setImage(null)
    img.src = resolveMediaUrl(url)
  }, [url])
  return image
}

function SlotPhoto({ slot, scale, isActive, onSelect, onTransform }) {
  const photoImg = useKonvaImage(slot.photoUrl)
  const groupRef = useRef(null)
  const trRef = useRef(null)

  useEffect(() => {
    if (isActive && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [isActive, photoImg])

  if (!photoImg) return null

  const t = slot.transform || {}
  const cx = slot.x + slot.width / 2 + (t.x || 0) * slot.width
  const cy = slot.y + slot.height / 2 + (t.y || 0) * slot.height
  const sc = Math.max(0.2, t.scale || 1)

  return (
    <>
      <Group
        ref={groupRef}
        x={cx}
        y={cy}
        rotation={t.rotate || 0}
        scaleX={t.flipX ? -sc : sc}
        scaleY={t.flipY ? -sc : sc}
        draggable={isActive}
        onClick={onSelect}
        onTap={onSelect}
        clipFunc={(ctx) => {
          const r = slot.borderRadius || 0
          const x = -slot.width / 2
          const y = -slot.height / 2
          const w = slot.width
          const h = slot.height
          if (r) {
            ctx.beginPath()
            ctx.moveTo(x + r, y)
            ctx.arcTo(x + w, y, x + w, y + h, r)
            ctx.arcTo(x + w, y + h, x, y + h, r)
            ctx.arcTo(x, y + h, x, y, r)
            ctx.arcTo(x, y, x + w, y, r)
            ctx.closePath()
          } else {
            ctx.rect(x, y, w, h)
          }
        }}
        onDragEnd={(e) => {
          const node = e.target
          const dx = (node.x() - (slot.x + slot.width / 2)) / slot.width
          const dy = (node.y() - (slot.y + slot.height / 2)) / slot.height
          onTransform({ x: dx, y: dy })
        }}
        onTransformEnd={() => {
          const node = groupRef.current
          if (!node) return
          const newScale = Math.abs(node.scaleX())
          onTransform({ scale: Math.max(0.2, Math.min(4, newScale)), rotate: node.rotation() })
        }}
      >
        <KonvaImage
          image={photoImg}
          width={slot.width}
          height={slot.height}
          offsetX={slot.width / 2}
          offsetY={slot.height / 2}
          listening={false}
        />
      </Group>
      {isActive && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 || newBox.height < 20 ? oldBox : newBox)}
        />
      )}
    </>
  )
}

function ClipartItem({ clip }) {
  const img = useKonvaImage(clip.src)
  if (!img || clip.visible === false) return null
  return (
    <KonvaImage
      image={img}
      x={clip.x}
      y={clip.y}
      width={clip.width}
      height={clip.height}
      rotation={clip.rotation}
      opacity={clip.opacity}
    />
  )
}

export function PersonalizerKonvaCanvas({
  state,
  activeSlotIndex,
  onSelectSlot,
  onSlotTransform,
  onTextSelect,
  onTextUpdate,
  width,
  height,
  onWheelZoom,
  onDoubleClickReset,
}) {
  const frameImg = useKonvaImage(state.overlayUrl || state.frameUrl)
  const bgImage = useKonvaImage(state.background?.type === 'image' ? state.background.imageUrl : '')

  const canvasW = state.canvas.width
  const canvasH = state.canvas.height
  const scale = Math.min(width / canvasW, height / canvasH) * (state.zoom || 1)

  const bg = state.background || {}
  const layerState = state.layerState || {}

  const showBg = layerState.background?.visible !== false
  const showPhotos = layerState.customerImage?.visible !== false
  const showFrame = layerState.frame?.visible !== false

  return (
    <div
      className="personalizer-konva-wrap"
      onWheel={onWheelZoom}
      onDoubleClick={() => onDoubleClickReset?.(activeSlotIndex)}
    >
      <Stage width={width} height={height} scaleX={scale} scaleY={scale} x={(width - canvasW * scale) / 2} y={(height - canvasH * scale) / 2}>
        {showBg && (
          <Layer listening={false}>
            {bg.type === 'image' && bgImage ? (
              <KonvaImage image={bgImage} width={canvasW} height={canvasH} />
            ) : bg.type === 'solid' ? (
              <Rect width={canvasW} height={canvasH} fill={bg.color || '#f3f4f6'} />
            ) : (
              <Rect width={canvasW} height={canvasH} fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: canvasW, y: canvasH }} fillLinearGradientColorStops={[0, bg.color || '#f3f4f6', 1, bg.color2 || '#e5e7eb']} />
            )}
          </Layer>
        )}

        {showPhotos && (
          <Layer>
            {state.slots.map((slot, i) => (
              <SlotPhoto
                key={slot.id || i}
                slot={slot}
                isActive={i === activeSlotIndex}
                onSelect={() => onSelectSlot(i)}
                onTransform={(patch) => onSlotTransform(i, patch)}
              />
            ))}
          </Layer>
        )}

        <Layer listening={false}>
          {state.clipartLayers?.map((clip) => (
            <ClipartItem key={clip.id} clip={clip} />
          ))}
        </Layer>

        <Layer>
          {state.textLayers?.map(
            (t) =>
              t.visible !== false && (
                <Text
                  key={t.id}
                  text={t.text}
                  x={t.x}
                  y={t.y}
                  fontSize={t.fontSize}
                  fontFamily={t.fontFamily}
                  fill={t.fill}
                  fontStyle={t.fontStyle === 'italic' ? 'italic' : 'normal'}
                  fontVariant="normal"
                  rotation={t.rotation}
                  opacity={t.opacity}
                  draggable={!t.locked}
                  onClick={() => onTextSelect?.(t.id)}
                  onTap={() => onTextSelect?.(t.id)}
                  onDragEnd={(e) => onTextUpdate?.(t.id, { x: e.target.x(), y: e.target.y() })}
                  offsetX={0}
                  offsetY={0}
                  align="center"
                />
              ),
          )}
        </Layer>

        {showFrame && frameImg && (
          <Layer listening={false}>
            <KonvaImage image={frameImg} width={canvasW} height={canvasH} />
          </Layer>
        )}
      </Stage>
    </div>
  )
}
