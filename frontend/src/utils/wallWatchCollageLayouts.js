/** Generate N photo slot boxes (2–6) on a square canvas for wall-watch collage mode */

const DEFAULT_CANVAS = { width: 1000, height: 1000 }

export const WALL_WATCH_COLLAGE_COUNTS = [2, 3, 4, 5, 6]

export function buildCollagePhotoBoxes(count = 4, canvas = DEFAULT_CANVAS) {
  const safeCount = Math.min(6, Math.max(2, Number(count) || 4))
  const bezel = 52
  const gap = 14
  const W = canvas.width - bezel * 2
  const H = canvas.height - bezel * 2
  const boxes = []

  const push = (id, x, y, width, height, borderRadius = 12) => {
    boxes.push({
      id,
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
      rotate: 0,
      borderRadius,
    })
  }

  if (safeCount === 2) {
    const w = (W - gap) / 2
    const h = H
    push(1, bezel, bezel, w, h)
    push(2, bezel + w + gap, bezel, w, h)
  } else if (safeCount === 3) {
    const w = (W - gap) / 2
    const h = (H - gap) / 2
    push(1, bezel, bezel, w, h)
    push(2, bezel + w + gap, bezel, w, h)
    push(3, bezel + (W - w) / 2, bezel + h + gap, w, h)
  } else if (safeCount === 4) {
    const w = (W - gap) / 2
    const h = (H - gap) / 2
    let id = 1
    for (let row = 0; row < 2; row += 1) {
      for (let col = 0; col < 2; col += 1) {
        push(id, bezel + col * (w + gap), bezel + row * (h + gap), w, h)
        id += 1
      }
    }
  } else if (safeCount === 5) {
    const w = (W - gap * 2) / 3
    const h = (H - gap) / 2
    for (let col = 0; col < 3; col += 1) {
      push(col + 1, bezel + col * (w + gap), bezel, w, h)
    }
    for (let col = 0; col < 2; col += 1) {
      push(4 + col, bezel + w / 2 + gap / 2 + col * (w + gap), bezel + h + gap, w, h)
    }
  } else {
    const w = (W - gap * 2) / 3
    const h = (H - gap) / 2
    let id = 1
    for (let row = 0; row < 2; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        push(id, bezel + col * (w + gap), bezel + row * (h + gap), w, h)
        id += 1
      }
    }
  }

  return boxes
}

export function isCollagePhotoCount(count) {
  return WALL_WATCH_COLLAGE_COUNTS.includes(Number(count))
}
