import { renderSmartMockup, exportSmartMockupVariants } from '../smartMockup/SmartMockupCompositor'

function drawTextLayer(ctx, layer) {
  if (!layer.visible && layer.visible !== undefined) return
  ctx.save()
  ctx.globalAlpha = layer.opacity ?? 1
  ctx.translate(layer.x, layer.y)
  ctx.rotate(((layer.rotation || 0) * Math.PI) / 180)
  const weight = layer.fontWeight || '600'
  const style = layer.fontStyle === 'italic' ? 'italic' : ''
  ctx.font = `${style} ${weight} ${layer.fontSize || 48}px ${layer.fontFamily || 'Inter'}, sans-serif`
  ctx.fillStyle = layer.fill || '#111827'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if (layer.shadowBlur) {
    ctx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = layer.shadowBlur
    ctx.shadowOffsetX = layer.shadowOffsetX || 0
    ctx.shadowOffsetY = layer.shadowOffsetY || 0
  }
  if (layer.stroke && layer.strokeWidth) {
    ctx.strokeStyle = layer.stroke
    ctx.lineWidth = layer.strokeWidth
    ctx.strokeText(layer.text || '', 0, 0)
  }
  ctx.fillText(layer.text || '', 0, 0)
  if (layer.underline) {
    const m = ctx.measureText(layer.text || '')
    ctx.beginPath()
    ctx.moveTo(-m.width / 2, layer.fontSize * 0.35)
    ctx.lineTo(m.width / 2, layer.fontSize * 0.35)
    ctx.strokeStyle = layer.fill || '#111827'
    ctx.lineWidth = Math.max(1, (layer.fontSize || 48) / 20)
    ctx.stroke()
  }
  ctx.restore()
}

function drawClipartLayer(ctx, layer, img) {
  if (!layer.visible && layer.visible !== undefined) return
  if (!img) return
  ctx.save()
  ctx.globalAlpha = layer.opacity ?? 1
  ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2)
  ctx.rotate(((layer.rotation || 0) * Math.PI) / 180)
  ctx.drawImage(img, -layer.width / 2, -layer.height / 2, layer.width, layer.height)
  ctx.restore()
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/** Extended render with text + clipart layers */
export async function renderPersonalizer(state, options = {}) {
  const bg = state.background
  let background = '#f3f4f6'
  if (bg?.type === 'solid') background = bg.color
  else if (bg?.type === 'gradient') background = bg.color

  const base = await renderSmartMockup(
    {
      ...state,
      background,
      layerVisibility: {
        ...state.layerVisibility,
        ...(state.layerState
          ? Object.fromEntries(Object.entries(state.layerState).map(([k, v]) => [k, v.visible !== false]))
          : {}),
      },
    },
    options,
  )

  if (!state.textLayers?.length && !state.clipartLayers?.length) return base

  const canvas = document.createElement('canvas')
  canvas.width = state.canvas.width
  canvas.height = state.canvas.height
  const ctx = canvas.getContext('2d')

  const baseImg = await loadImage(base.dataUrl)
  ctx.drawImage(baseImg, 0, 0)

  const frameVisible = state.layerVisibility?.frame !== false && state.layerState?.frame?.visible !== false

  for (const layer of state.clipartLayers || []) {
    if (!layer.src) continue
    try {
      const img = await loadImage(layer.src)
      drawClipartLayer(ctx, layer, img)
    } catch {
      /* skip */
    }
  }

  for (const layer of state.textLayers || []) {
    drawTextLayer(ctx, layer)
  }

  if (frameVisible && state.frameUrl) {
    try {
      const frame = await loadImage(state.overlayUrl || state.frameUrl)
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height)
    } catch {
      /* optional */
    }
  }

  const format = options.format || 'png'
  const quality = options.quality ?? 0.92
  const mime = format === 'webp' ? 'image/webp' : format === 'jpeg' ? 'image/jpeg' : 'image/png'

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve({
          blob,
          dataUrl: blob ? URL.createObjectURL(blob) : canvas.toDataURL(mime, quality),
          width: canvas.width,
          height: canvas.height,
        })
      },
      mime,
      quality,
    )
  })
}

export async function exportPersonalizerVariants(state) {
  const [png, webp, jpeg, thumb] = await Promise.all([
    renderPersonalizer(state, { format: 'png' }),
    renderPersonalizer(state, { format: 'webp', quality: 0.85 }),
    renderPersonalizer(state, { format: 'jpeg', quality: 0.9 }),
    renderPersonalizer(
      {
        ...state,
        canvas: {
          width: Math.round(state.canvas.width * 0.35),
          height: Math.round(state.canvas.height * 0.35),
        },
      },
      { format: 'webp', quality: 0.8 },
    ),
  ])

  return {
    merged: png.dataUrl,
    png: png.dataUrl,
    webp: webp.dataUrl,
    jpeg: jpeg.dataUrl,
    thumbnail: thumb.dataUrl,
    transparent: png.dataUrl,
    catalog: webp.dataUrl,
    cart: webp.dataUrl,
    checkout: png.dataUrl,
    order: png.dataUrl,
    admin: png.dataUrl,
  }
}

export { exportSmartMockupVariants }
