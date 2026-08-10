/**
 * Live dummy thumbnails — baad mein apni images se replace kar sakte ho.
 * File: frontend/src/data/productFrameGallery.js
 */
export const DUMMY_PRODUCT_THUMBNAILS = [
  {
    id: 'dummy-1',
    label: 'Outdoor',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&h=640&auto=format&fit=crop&q=80',
  },
  {
    id: 'dummy-2',
    label: 'Living Room',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&h=640&auto=format&fit=crop&q=80',
  },
  {
    id: 'dummy-3',
    label: 'Family Frame',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&h=640&auto=format&fit=crop&q=80',
  },
  {
    id: 'dummy-4',
    label: 'Wall Decor',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&h=640&auto=format&fit=crop&q=80',
  },
  {
    id: 'dummy-5',
    label: 'Portrait',
    image: 'https://images.unsplash.com/photo-1531981936561-347fb37a966a?w=900&h=640&auto=format&fit=crop&q=80',
  },
]

/** Category-wise live dummy thumbnails */
export const LIVE_THUMBNAILS_BY_TYPE = {
  'custom-wall-watch': [
    { id: 'clock-1', label: 'Round Clock', image: 'https://images.unsplash.com/photo-1563861826100-9cb088fdbe1c?w=900&h=640&auto=format&fit=crop&q=80' },
    { id: 'clock-2', label: 'Wall Clock', image: 'https://images.unsplash.com/photo-1515488042361-ee00e945b422?w=900&h=640&auto=format&fit=crop&q=80' },
    { id: 'clock-3', label: 'Modern', image: 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=900&h=640&fit=crop' },
    { id: 'clock-4', label: 'Classic', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&h=640&auto=format&fit=crop&q=80' },
  ],
  'acrylic-wall-photo': [
    { id: 'wall-1', label: 'Portrait', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&h=640&auto=format&fit=crop&q=80' },
    { id: 'wall-2', label: 'Gallery', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&h=640&auto=format&fit=crop&q=80' },
    { id: 'wall-3', label: 'Couple', image: 'https://images.unsplash.com/photo-1522673606300-8adb96334055?w=900&h=640&auto=format&fit=crop&q=80' },
    { id: 'wall-4', label: 'Minimal', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=900&h=640&fit=crop' },
  ],
  'photo-album': [
    { id: 'album-1', label: 'Wedding', image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&h=640&auto=format&fit=crop&q=80' },
    { id: 'album-2', label: 'Memories', image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&h=640&auto=format&fit=crop&q=80' },
    { id: 'album-3', label: 'Travel', image: 'https://images.pexels.com/photos/196659/pexels-photo-196659.jpeg?auto=compress&cs=tinysrgb&w=900&h=640&fit=crop' },
    { id: 'album-4', label: 'Classic', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&h=640&auto=format&fit=crop&q=80' },
  ],
  'acrylic-name-plate': [
    { id: 'plate-1', label: 'Outdoor', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&h=640&auto=format&fit=crop&q=80' },
    { id: 'plate-2', label: 'Entrance', image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cd7a?w=900&h=640&auto=format&fit=crop&q=80' },
    { id: 'plate-3', label: 'Night Glow', image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=900&h=640&fit=crop' },
    { id: 'plate-4', label: 'Modern Home', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&h=640&auto=format&fit=crop&q=80' },
  ],
  'acrylic-photo-frame': [
    { id: 'frame-1', label: 'Desk Frame', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&h=640&auto=format&fit=crop&q=80' },
    { id: 'frame-2', label: 'Floating', image: 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=900&h=640&fit=crop' },
    { id: 'frame-3', label: 'Family', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&h=640&auto=format&fit=crop&q=80' },
    { id: 'frame-4', label: 'White Frame', image: 'https://images.unsplash.com/photo-1531981936561-347fb37a966a?w=900&h=640&auto=format&fit=crop&q=80' },
  ],
}

/** Product card — admin thumbnail, gallery images, or category dummy thumbnails */
export function getProductCardThumbnails(product) {
  if (product?.thumbnail) {
    return [{
      id: `${product.slug}-thumbnail`,
      label: 'Thumbnail',
      image: product.thumbnail,
    }]
  }
  const fromProduct = (product?.images || []).filter(Boolean)
  if (fromProduct.length) {
    return fromProduct.map((image, index) => ({
      id: `${product.slug}-img-${index}`,
      label: `View ${index + 1}`,
      image,
    }))
  }
  return LIVE_THUMBNAILS_BY_TYPE[product?.productType] || DUMMY_PRODUCT_THUMBNAILS
}

/** Sample people photos for frame previews (Unsplash — free to hotlink) */
export const SAMPLE_PEOPLE_PHOTOS = [
  {
    id: 'family',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80',
    label: 'Family',
  },
  {
    id: 'couple',
    url: 'https://images.unsplash.com/photo-1522673606300-8adb96334055?w=600&auto=format&fit=crop&q=80',
    label: 'Couple',
  },
  {
    id: 'portrait-w',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    label: 'Portrait',
  },
  {
    id: 'portrait-m',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    label: 'Classic',
  },
  {
    id: 'kids',
    url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format&fit=crop&q=80',
    label: 'Kids',
  },
  {
    id: 'wedding',
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&auto=format&fit=crop&q=80',
    label: 'Wedding',
  },
]

const photo = (index) => SAMPLE_PEOPLE_PHOTOS[index % SAMPLE_PEOPLE_PHOTOS.length].url

const PRESETS_BY_TYPE = {
  'custom-wall-watch': [
    { id: 'round', label: 'Round', shape: 'round', photoIndex: 0, options: { shape: 'Circle', frameStyle: 'Round', layout: 'Single' } },
    { id: 'square-round', label: 'Square Round', shape: 'square-round', photoIndex: 1, options: { shape: 'Square Round', frameStyle: 'Square Round', layout: 'Single' } },
    { id: 'square', label: 'Square', shape: 'square', photoIndex: 2, options: { shape: 'Square', frameStyle: 'Square', layout: 'Single' } },
    { id: 'collage', label: 'Collage', shape: 'collage', photoIndex: 3, options: { shape: 'Circle', frameStyle: 'Collage', layout: 'Collage', collageEnabled: true, collagePhotoCount: 4 } },
  ],
  'acrylic-wall-photo': [
    { id: 'portrait', label: 'Portrait', shape: 'portrait', photoIndex: 0, options: { frameStyle: 'Classic', finish: 'Glossy Varnish', layout: 'Single' } },
    { id: 'dual', label: 'Dual Border', shape: 'portrait', photoIndex: 1, options: { frameStyle: 'Dual Border', finish: 'Glossy Varnish', layout: 'Single' } },
    { id: 'float', label: 'Floating', shape: 'square', photoIndex: 2, options: { frameStyle: 'Floating', finish: 'Matte', layout: 'Single' } },
    { id: 'collage', label: 'Collage', shape: 'collage', photoIndex: 4, options: { frameStyle: 'Collage', layout: 'Collage', finish: 'Glossy Varnish' } },
  ],
  'photo-album': [
    { id: 'classic', label: 'Classic', shape: 'portrait', photoIndex: 0, options: { frameStyle: 'Hardbound', finish: 'Matte', layout: 'Single' } },
    { id: 'wedding', label: 'Wedding', shape: 'portrait', photoIndex: 5, options: { frameStyle: 'Hardbound', finish: 'Glossy Varnish', layout: 'Single' } },
    { id: 'family', label: 'Family', shape: 'portrait', photoIndex: 0, options: { frameStyle: 'Hardbound', finish: 'Matte', layout: 'Single' } },
    { id: 'travel', label: 'Travel', shape: 'square', photoIndex: 2, options: { frameStyle: 'Hardbound', finish: 'Glossy Varnish', layout: 'Single' } },
  ],
  'acrylic-photo-frame': [
    { id: 'float', label: 'Floating', shape: 'portrait', photoIndex: 1, options: { frameStyle: 'Floating', finish: 'Glossy Varnish' } },
    { id: 'classic', label: 'Classic', shape: 'portrait', photoIndex: 0, options: { frameStyle: 'Classic', finish: 'Matte' } },
    { id: 'modern', label: 'Modern', shape: 'square', photoIndex: 3, options: { frameStyle: 'Modern', finish: 'Crystal Clear' } },
    { id: 'dual', label: 'Dual', shape: 'portrait', photoIndex: 4, options: { frameStyle: 'Dual Border', finish: 'Glossy Varnish' } },
  ],
  'acrylic-name-plate': [
    { id: 'outdoor', label: 'Outdoor', shape: 'round', photoIndex: 3, options: { frameStyle: 'Backlit', finish: 'Gold Finish' } },
    { id: 'round', label: 'Round', shape: 'round', photoIndex: 1, options: { frameStyle: 'Round', finish: 'Gold Finish' } },
    { id: 'layered', label: 'Layered', shape: 'square', photoIndex: 0, options: { frameStyle: 'Layered', finish: 'Matte' } },
    { id: 'modern', label: 'Modern', shape: 'square', photoIndex: 2, options: { frameStyle: 'Modern', finish: 'Silver Finish' } },
  ],
  'god-photo-frame': [
    { id: 'god-1', label: 'God Frame', shape: 'portrait', photoIndex: 0, options: { frameStyle: 'Classic', finish: 'Glossy Varnish' } },
  ],
  'photo-clock': [
    { id: 'clock-1', label: 'Round Clock', shape: 'round', photoIndex: 0, options: { shape: 'Square Round', frameStyle: 'Round', layout: 'Single' } },
  ],
  'personalised-keychain': [
    { id: 'key-1', label: 'Keychain', shape: 'square', photoIndex: 3, options: { frameStyle: 'Modern', finish: 'Glossy Varnish' } },
  ],
  'wooden-photo-frame': [
    { id: 'wood-1', label: 'Wooden', shape: 'portrait', photoIndex: 0, options: { frameStyle: 'Classic', finish: 'Matte' } },
  ],
  'canvas-print': [
    { id: 'canvas-1', label: 'Canvas', shape: 'portrait', photoIndex: 2, options: { frameStyle: 'Floating', finish: 'Matte' } },
  ],
}

const DEFAULT_PRESETS = [
  { id: 'style-1', label: 'Classic', shape: 'portrait', photoIndex: 0, options: { frameStyle: 'Classic', finish: 'Glossy Varnish' } },
  { id: 'style-2', label: 'Modern', shape: 'square', photoIndex: 1, options: { frameStyle: 'Modern', finish: 'Matte' } },
  { id: 'style-3', label: 'Floating', shape: 'portrait', photoIndex: 2, options: { frameStyle: 'Floating', finish: 'Crystal Clear' } },
  { id: 'style-4', label: 'Premium', shape: 'portrait', photoIndex: 3, options: { frameStyle: 'Dual Border', finish: 'Glossy Varnish' } },
]

export function getProductFramePresets(product) {
  const type = product?.productType || ''
  const base = PRESETS_BY_TYPE[type] || DEFAULT_PRESETS
  const productImage = product?.images?.[0]

  return base.map((preset) => ({
    ...preset,
    photoUrl: productImage || preset.photoUrl || photo(preset.photoIndex),
    photoLabel:
      preset.photoLabel ||
      SAMPLE_PEOPLE_PHOTOS[preset.photoIndex % SAMPLE_PEOPLE_PHOTOS.length]?.label ||
      preset.label,
  }))
}

export function findMatchingVariant(product, preset) {
  if (!product?.variants?.length || !preset?.options?.frameStyle) return product?.variants?.[0]

  const frame = preset.options.frameStyle.toLowerCase()
  const match = product.variants.find((v) => v.frameType?.toLowerCase().includes(frame.split(' ')[0]))
  return match || product.variants[0]
}
