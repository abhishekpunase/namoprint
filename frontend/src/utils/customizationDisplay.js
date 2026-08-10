const CUSTOMIZATION_SKIP_KEYS = new Set([
  'previewUrl',
  'designImageUrl',
  'photoUrl',
  'photos',
  'slotPhotos',
  'canvasText',
  'itemType',
  'frameColor',
  'logoUrl',
  'labelImageUrl',
  'logoAssetId',
  'designFileUrl',
  'productImageUrl',
  'sizeQuantities',
  'photoUrls',
  '_id',
])

const OPTION_LABELS = {
  layout: 'Layout',
  size: 'Size',
  material: 'Material',
  mounting: 'Mounting',
  frameStyle: 'Frame style',
  finish: 'Finish',
  shape: 'Shape',
  thickness: 'Thickness',
  orientation: 'Orientation',
  clockHands: 'Clock hands',
  dialStyle: 'Dial style',
  numberStyle: 'Number style',
  numberColor: 'Number color',
  set: 'Photo set',
  headingText: 'Name',
  subText: 'Address',
  username: 'Name on pen',
  labelImageUrl: 'Label artwork',
  babyName: "Baby's name",
  birthDate: 'Birth date',
  birthTime: 'Birth time',
  weight: 'Weight',
  height: 'Height',
  hospital: 'Hospital / birth place',
  proudParents: 'Proud parents',
  gender: 'Gender',
  mainHeading: 'Main heading',
  subHeading: 'Sub heading',
  thirdLine: 'Third line',
  recipientName: 'Recipient name',
  eventName: 'Event name',
  awardDate: 'Award date',
  organizationName: 'Organization',
  familyName: 'Family name',
  addressLine: 'Address line',
}

function formatOptionLabel(key) {
  if (OPTION_LABELS[key]) return OPTION_LABELS[key]
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

function pushLine(lines, label, value) {
  if (value === null || value === undefined || value === '') return
  if (typeof value === 'object') return
  lines.push({ label, value: String(value) })
}

/** Preview image URL from cart/order line item */
export function getCustomizationPreviewUrl(item) {
  if (!item) return ''
  if (item.productionFileUrl) return item.productionFileUrl
  const c = item.customization || item
  if (typeof c !== 'object') return ''
  return c.designImageUrl || c.previewUrl || c.photoUrl || ''
}

/** Human-readable customization lines for any product type */
export function getCustomizationSummaryLines(customization) {
  if (!customization || typeof customization !== 'object') return []

  const lines = []
  const c = customization

  if (c.qualityLabel) pushLine(lines, 'Quality / size', c.qualityLabel)
  if (c.headingText?.trim()) pushLine(lines, 'Name', c.headingText.trim())
  if (c.subText?.trim()) pushLine(lines, 'Address', c.subText.trim())
  if (c.username?.trim()) pushLine(lines, 'Name on pen', c.username.trim())
  if (c.labelImageUrl) pushLine(lines, 'Label artwork', c.labelFileName || 'Uploaded')
  if (c.gender) pushLine(lines, 'Gender', c.gender)
  if (c.babyName?.trim()) pushLine(lines, "Baby's name", c.babyName.trim())
  if (c.birthDate) pushLine(lines, 'Birth date', c.birthDate)
  if (c.birthTime) pushLine(lines, 'Birth time', c.birthTime)
  if (c.weight) pushLine(lines, 'Weight', c.weight)
  if (c.height) pushLine(lines, 'Height', c.height)
  if (c.hospital) pushLine(lines, 'Hospital', c.hospital)
  if (c.proudParents) pushLine(lines, 'Proud parents', c.proudParents)
  if (c.mainHeading?.trim()) pushLine(lines, 'Main heading', c.mainHeading.trim())
  if (c.subHeading?.trim()) pushLine(lines, 'Sub heading', c.subHeading.trim())
  if (c.thirdLine?.trim()) pushLine(lines, 'Third line', c.thirdLine.trim())
  if (c.recipientName?.trim()) pushLine(lines, 'Recipient', c.recipientName.trim())
  if (c.eventName) pushLine(lines, 'Event', c.eventName)
  if (c.awardDate) pushLine(lines, 'Award date', c.awardDate)
  if (c.organizationName) pushLine(lines, 'Organization', c.organizationName)
  if (Array.isArray(c.photoUrls) && c.photoUrls.length) {
    pushLine(lines, 'Photos', `${c.photoUrls.length} uploaded`)
  }

  if (c.sizeQuantities && typeof c.sizeQuantities === 'object') {
    const sizeParts = Object.entries(c.sizeQuantities)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([size, qty]) => `${size}×${qty}`)
    if (sizeParts.length) pushLine(lines, 'Sizes', sizeParts.join(', '))
  }
  if (c.logoUrl) pushLine(lines, 'Logo', c.logoFileName || 'Uploaded')
  if (c.designFileUrl) pushLine(lines, 'Design file', c.designFileName || 'Uploaded')
  if (c.productImageUrl) pushLine(lines, 'T-shirt', 'Selected')

  if (c.notes?.trim()) {
    pushLine(lines, c.itemType === 'tshirt' ? 'Print notes' : 'Design notes', c.notes.trim())
  }

  if (c.options && typeof c.options === 'object') {
    Object.entries(c.options).forEach(([key, value]) => {
      if (value) pushLine(lines, formatOptionLabel(key), value)
    })
  }

  const slotCount = Array.isArray(c.slotPhotos) ? c.slotPhotos.length : 0
  const photoCount = Array.isArray(c.photos) ? c.photos.length : 0
  if (slotCount > 1) {
    pushLine(lines, 'Photos', `${slotCount} slots in collage`)
  } else if (slotCount === 1) {
    pushLine(lines, 'Photos', '1 photo uploaded')
  } else if (photoCount > 0) {
    pushLine(lines, 'Photos', `${photoCount} photo${photoCount > 1 ? 's' : ''} uploaded`)
  }

  if (c.frameColorName || c.frameColor) {
    pushLine(lines, 'Frame color', c.frameColorName || c.frameColor)
  }
  if (c.thickness && !String(c.options?.material || '').includes(c.thickness)) {
    pushLine(lines, 'Thickness', c.thickness)
  }
  if (c.orientation && !c.options?.orientation) {
    pushLine(lines, 'Orientation', c.orientation)
  }
  if (c.size && !c.options?.size) {
    pushLine(lines, 'Size', c.size)
  }

  if (c.text && typeof c.text === 'object') {
    Object.entries(c.text).forEach(([key, value]) => {
      if (value?.trim?.()) pushLine(lines, formatOptionLabel(key), value.trim())
    })
  }

  if (Array.isArray(c.canvasText) && c.canvasText.length) {
    const textPreview = c.canvasText
      .map((entry) => entry?.value)
      .filter(Boolean)
      .join(', ')
    if (textPreview) pushLine(lines, 'Text on design', textPreview)
  }

  Object.entries(c).forEach(([key, value]) => {
    if (CUSTOMIZATION_SKIP_KEYS.has(key)) return
    if (
      ['options', 'text', 'notes', 'qualityLabel', 'headingText', 'subText', 'username', 'labelImageUrl', 'labelFileName', 'frameColorName', 'frameColor', 'thickness', 'orientation', 'size'].includes(
        key,
      )
    ) {
      return
    }
    if (!value || typeof value === 'object') return
    pushLine(lines, formatOptionLabel(key), value)
  })

  return lines
}

/** One-line summary for cart / list subtitles */
export function getCustomizationSummaryText(customization, { maxParts = 3 } = {}) {
  const lines = getCustomizationSummaryLines(customization)
  if (!lines.length) return ''
  return lines
    .slice(0, maxParts)
    .map(({ label, value }) => `${label}: ${value}`)
    .join(' · ')
}
