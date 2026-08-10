export const customizationTemplates = {
  // ---------- Photo Clock ----------
  'custom-wall-watch': {
    tabs: ['All', 'Collage'],
    optionGroups: [
      {
        key: 'shape',
        label: 'Clock shape',
        values: ['Circle', 'Square', 'Square Round'],
      },
      {
        key: 'clockHands',
        label: 'Clock hands',
        values: ['Classic Silver', 'Bold Black', 'Gold Premium'],
      },
      {
        key: 'size',
        label: 'Size',
        values: ['10 inch', '12 inch', '14 inch'],
      },
      {
        key: 'dialStyle',
        label: 'Dial numbers',
        values: ['Modern Numbers', 'Minimal Marks', 'No Numbers'],
      },
      {
        key: 'numberStyle',
        label: 'Number style',
        values: [
          'Modern',
          'Outline',
          'Script',
          'Retro',
          'Bold',
          'Roman',
          'Dots',
        ],
      },
      {
        key: 'numberColor',
        label: 'Number color',
        values: ['White', 'Black', 'Gold', 'Red', 'Blue', 'Green', 'Orange', 'Silver'],
      },
    ],
    photoSlots: 4,
  },
  'photo-clock': {
    tabs: ['All', 'Collage'],
    optionGroups: [
      { key: 'shape', label: 'Clock shape', values: ['Circle', 'Square', 'Square Round'] },
      { key: 'clockHands', label: 'Clock hands', values: ['Classic Silver', 'Bold Black', 'Gold Premium'] },
      { key: 'size', label: 'Size', values: ['10 inch', '12 inch', '14 inch'] },
      { key: 'dialStyle', label: 'Dial numbers', values: ['Modern Numbers', 'Minimal Marks', 'No Numbers'] },
      { key: 'numberStyle', label: 'Number style', values: ['Modern', 'Outline', 'Script', 'Retro', 'Bold', 'Roman', 'Dots'] },
      { key: 'numberColor', label: 'Number color', values: ['White', 'Black', 'Gold', 'Red', 'Blue', 'Green', 'Orange', 'Silver'] },
    ],
    photoSlots: 4,
  },

  // ---------- Acrylic Photo Frame(s) ----------
  'acrylic-photo-frame': {
    optionGroups: [
      { key: 'frameStyle', label: 'Frame style', values: ['Table Top', 'Wall Mount', 'Magnetic', 'Floating Acrylic'] },
      { key: 'size', label: 'Size', values: ['6x8 inch', '8x12 inch', '12x18 inch'] },
      { key: 'material', label: 'Acrylic thickness', values: ['3mm Acrylic', '5mm Acrylic', '8mm Acrylic'] },
      { key: 'finish', label: 'Finish', values: ['Glossy', 'Matte', 'Crystal Clear'] },
    ],
    photoSlots: 1,
  },
  'acrylic-photo-frames': {
    optionGroups: [
      { key: 'frameStyle', label: 'Frame style', values: ['Table Top', 'Wall Mount', 'Magnetic', 'Floating Acrylic'] },
      { key: 'size', label: 'Size', values: ['6x8 inch', '8x12 inch', '12x18 inch'] },
      { key: 'material', label: 'Acrylic thickness', values: ['3mm Acrylic', '5mm Acrylic', '8mm Acrylic'] },
      { key: 'finish', label: 'Finish', values: ['Glossy', 'Matte', 'Crystal Clear'] },
    ],
    photoSlots: 1,
  },
  'acrylic-wall-photo': {
    optionGroups: [
      { key: 'layout', label: 'Layout', values: ['Portrait', 'Landscape', 'Square', 'Dual Border', 'Collage'] },
      { key: 'size', label: 'Size', values: ['8x12 inch', '12x18 inch', '16x24 inch'] },
      { key: 'material', label: 'Acrylic thickness', values: ['3mm Acrylic', '5mm Acrylic'] },
      { key: 'mounting', label: 'Mounting', values: ['Ready to Hang', 'Stand Off Bolts', 'Adhesive Mount'] },
    ],
    photoSlots: 4,
  },

  // ---------- Name Plates ----------
  'acrylic-name-plate': {
    optionGroups: [
      { key: 'plateStyle', label: 'Plate style', values: ['Modern', 'Luxury Gold', 'LED Look', 'Family Monogram'] },
      { key: 'size', label: 'Size', values: ['12x6 inch', '16x8 inch', '18x10 inch'] },
      { key: 'material', label: 'Material', values: ['5mm Acrylic', 'Layered Acrylic', 'Wood + Acrylic'] },
      { key: 'mounting', label: 'Mounting', values: ['Wall Screws', 'Stud Mount', 'Adhesive Mount'] },
    ],
    photoSlots: 0,
  },
  'name-plates': {
    optionGroups: [
      { key: 'plateStyle', label: 'Plate style', values: ['Modern', 'Luxury Gold', 'LED Look', 'Family Monogram'] },
      { key: 'size', label: 'Size', values: ['12x6 inch', '16x8 inch', '18x10 inch'] },
      { key: 'material', label: 'Material', values: ['5mm Acrylic', 'Layered Acrylic', 'Wood + Acrylic'] },
      { key: 'mounting', label: 'Mounting', values: ['Wall Screws', 'Stud Mount', 'Adhesive Mount'] },
    ],
    photoSlots: 0,
  },
  'acrylic-monogram-nameplate': {
    optionGroups: [
      { key: 'monogram', label: 'Monogram', values: ['Couple Initials', 'Family Crest', 'Minimal Circle'] },
      { key: 'size', label: 'Size', values: ['12x8 inch', '16x10 inch', '20x12 inch'] },
      { key: 'finish', label: 'Finish', values: ['Gold Accent', 'Black Accent', 'Frosted Acrylic'] },
    ],
    photoSlots: 0,
  },

  // ---------- Keychains / Tags ----------
  'personalised-keychain': {
    optionGroups: [
      { key: 'shape', label: 'Shape', values: ['Heart', 'Round', 'Square', 'Rectangle'] },
      { key: 'printSide', label: 'Print side', values: ['Single Side', 'Double Side'] },
      { key: 'ring', label: 'Ring style', values: ['Silver Ring', 'Gold Ring', 'Leather Loop'] },
    ],
    photoSlots: 1,
  },
  'luggage-tag': {
    optionGroups: [
      { key: 'shape', label: 'Shape', values: ['Rounded Rectangle', 'Kids Tag', 'Photo Tag'] },
      { key: 'strap', label: 'Strap', values: ['Black Strap', 'Tan Strap', 'Red Strap'] },
      { key: 'printSide', label: 'Print side', values: ['Front Only', 'Front + Back'] },
    ],
    photoSlots: 1,
  },

  // ---------- Acrylic Gallery / Stand ----------
  'acrylic-photo-mini-wall-gallery': {
    optionGroups: [
      { key: 'set', label: 'Gallery set', values: ['3 Photo Set', '6 Photo Set', '9 Photo Set'] },
      { key: 'tileSize', label: 'Tile size', values: ['5x5 inch', '6x6 inch', '8x8 inch'] },
      { key: 'spacing', label: 'Wall spacing', values: ['Compact', 'Gallery', 'Wide'] },
    ],
    photoSlots: 9,
  },
  'acrylic-photo-stand': {
    optionGroups: [
      { key: 'standStyle', label: 'Stand style', values: ['Desk Stand', 'Spotify Stand', 'Mini Stand'] },
      { key: 'size', label: 'Size', values: ['4x6 inch', '5x7 inch', '6x8 inch'] },
      { key: 'base', label: 'Base', values: ['Clear Acrylic', 'Black Acrylic', 'Wood Base'] },
    ],
    photoSlots: 1,
  },

  // ---------- Photo Album ----------
  'photo-album': {
    optionGroups: [
      { key: 'albumType', label: 'Album type', values: ['Wedding', 'Baby', 'Travel', 'Family'] },
      { key: 'pages', label: 'Pages', values: ['20 Pages', '30 Pages', '40 Pages'] },
      { key: 'cover', label: 'Cover', values: ['Acrylic Cover', 'Leather Cover', 'Photo Cover'] },
      { key: 'paper', label: 'Paper', values: ['Glossy', 'Matte', 'Lustre'] },
    ],
    photoSlots: 6,
  },

  // ---------- UV DTF Stickers ----------
  'uv-dtf-stickers': {
    optionGroups: [
      { key: 'sheetSize', label: 'Sheet size', values: ['A4 Sheet', 'A5 Sheet', 'Custom Size'] },
      { key: 'shape', label: 'Shape', values: ['Die Cut', 'Round', 'Square', 'Rectangle'] },
      { key: 'finish', label: 'Finish', values: ['Glossy', 'Matte', 'Holographic'] },
      { key: 'quantity', label: 'Quantity', values: ['50 Pcs', '100 Pcs', '250 Pcs'] },
    ],
    photoSlots: 1,
  },

  // ---------- Logo Stickers ----------
  'logo-stickers': {
    optionGroups: [
      { key: 'shape', label: 'Shape', values: ['Circle', 'Square', 'Custom Die Cut'] },
      { key: 'material', label: 'Material', values: ['Vinyl', 'Paper', 'Transparent PVC'] },
      { key: 'finish', label: 'Finish', values: ['Glossy', 'Matte'] },
      { key: 'quantity', label: 'Quantity', values: ['100 Pcs', '250 Pcs', '500 Pcs'] },
    ],
    photoSlots: 1,
  },

  // ---------- Product Labels ----------
  'product-labels': {
    optionGroups: [
      { key: 'shape', label: 'Shape', values: ['Rectangle', 'Circle', 'Custom Shape'] },
      { key: 'material', label: 'Material', values: ['Paper', 'Vinyl', 'Waterproof PVC'] },
      { key: 'finish', label: 'Finish', values: ['Glossy', 'Matte'] },
      { key: 'quantity', label: 'Quantity', values: ['100 Pcs', '500 Pcs', '1000 Pcs'] },
    ],
    photoSlots: 1,
  },

  // ---------- T-Shirt Printing ----------
  't-shirt-printing': {
    optionGroups: [
      { key: 'tshirtType', label: 'T-shirt type', values: ['Round Neck', 'Polo', 'Oversized', 'V-Neck'] },
      { key: 'size', label: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL'] },
      { key: 'color', label: 'Color', values: ['White', 'Black', 'Navy', 'Grey'] },
      { key: 'printType', label: 'Print type', values: ['DTF Print', 'Screen Print', 'Embroidery'] },
    ],
    photoSlots: 1,
  },

  // ---------- Corporate Gift Printing ----------
  'corporate-gift-printing': {
    optionGroups: [
      { key: 'giftType', label: 'Gift type', values: ['Mug', 'Pen', 'Diary', 'Combo Set'] },
      { key: 'branding', label: 'Branding', values: ['Logo Print', 'Logo Engrave', 'Full Custom'] },
      { key: 'packaging', label: 'Packaging', values: ['Standard Box', 'Premium Box'] },
      { key: 'quantity', label: 'Quantity', values: ['10 Pcs', '50 Pcs', '100 Pcs'] },
    ],
    photoSlots: 1,
  },

  // ---------- Wooden Photo Frame ----------
  'wooden-photo-frame': {
    optionGroups: [
      { key: 'frameStyle', label: 'Frame style', values: ['Classic', 'Carved', 'Rustic', 'Modern'] },
      { key: 'size', label: 'Size', values: ['6x8 inch', '8x12 inch', '12x18 inch'] },
      { key: 'woodType', label: 'Wood type', values: ['Teak Finish', 'Walnut Finish', 'Oak Finish'] },
      { key: 'finish', label: 'Finish', values: ['Matte', 'Glossy Varnish'] },
    ],
    photoSlots: 1,
  },

  // ---------- LED Photo Frame ----------
  'led-photo-frame': {
    optionGroups: [
      { key: 'frameStyle', label: 'Frame style', values: ['Backlit Panel', 'Border Glow', 'Standing LED'] },
      { key: 'size', label: 'Size', values: ['8x10 inch', '10x14 inch', '12x18 inch'] },
      { key: 'lightColor', label: 'Light color', values: ['Warm White', 'Cool White', 'RGB Multicolor'] },
      { key: 'power', label: 'Power source', values: ['USB Powered', 'Battery Powered'] },
    ],
    photoSlots: 1,
  },

  // ---------- Table Photo Frame ----------
  'table-photo-frame': {
    optionGroups: [
      { key: 'frameStyle', label: 'Frame style', values: ['Classic Stand', 'Dual Photo', 'Rotating Stand'] },
      { key: 'size', label: 'Size', values: ['4x6 inch', '5x7 inch', '6x8 inch'] },
      { key: 'material', label: 'Material', values: ['Wood', 'Acrylic', 'Metal'] },
      { key: 'finish', label: 'Finish', values: ['Glossy', 'Matte'] },
    ],
    photoSlots: 1,
  },

  // ---------- Wall Photo Frame ----------
  'wall-photo-frame': {
    optionGroups: [
      { key: 'layout', label: 'Layout', values: ['Single Frame', 'Set of 3', 'Set of 5', 'Grid Collage'] },
      { key: 'size', label: 'Size', values: ['8x12 inch', '12x18 inch', '16x24 inch'] },
      { key: 'material', label: 'Material', values: ['Wood', 'Acrylic', 'Metal'] },
      { key: 'mounting', label: 'Mounting', values: ['Ready to Hang', 'Adhesive Mount'] },
    ],
    photoSlots: 5,
  },

  // ---------- Photo Collage ----------
  'photo-collage': {
    optionGroups: [
      { key: 'layout', label: 'Layout', values: ['Grid', 'Heart Shape', 'Freeform', 'Number Shape'] },
      { key: 'size', label: 'Size', values: ['12x18 inch', '16x24 inch', '24x36 inch'] },
      { key: 'material', label: 'Print material', values: ['Photo Paper', 'Canvas', 'Acrylic'] },
      { key: 'photoCount', label: 'Photo count', values: ['9 Photos', '16 Photos', '25 Photos'] },
    ],
    photoSlots: 9,
  },

  // ---------- Canvas Print ----------
  'canvas-print': {
    optionGroups: [
      { key: 'layout', label: 'Layout', values: ['Single Panel', 'Split 2 Panel', 'Split 3 Panel'] },
      { key: 'size', label: 'Size', values: ['12x18 inch', '16x24 inch', '24x36 inch'] },
      { key: 'frameEdge', label: 'Frame edge', values: ['Gallery Wrap', 'Black Border', 'White Border'] },
      { key: 'finish', label: 'Finish', values: ['Matte', 'Glossy'] },
    ],
    photoSlots: 1,
  },

  // ---------- Personalized Wall Art ----------
  'personalized-wall-art': {
    optionGroups: [
      { key: 'artStyle', label: 'Art style', values: ['Name Art', 'Family Tree', 'Quote Art', 'Photo Art'] },
      { key: 'size', label: 'Size', values: ['12x18 inch', '16x24 inch', '20x30 inch'] },
      { key: 'material', label: 'Material', values: ['Canvas', 'Acrylic', 'Wood Panel'] },
      { key: 'colorTheme', label: 'Color theme', values: ['Vibrant', 'Pastel', 'Black & White'] },
    ],
    photoSlots: 1,
  },

  // ---------- Temple Photo Frame ----------
  'temple-photo-frame': {
    optionGroups: [
      { key: 'frameStyle', label: 'Frame style', values: ['Classic Mandir', 'Arch Style', 'LED Mandir Frame'] },
      { key: 'size', label: 'Size', values: ['10x14 inch', '14x18 inch', '18x24 inch'] },
      { key: 'material', label: 'Material', values: ['Wood', 'Acrylic', 'Metal Finish'] },
      { key: 'finish', label: 'Finish', values: ['Gold Finish', 'Silver Finish', 'Natural Wood'] },
    ],
    photoSlots: 1,
  },

  // ---------- God Photo Frame ----------
  'god-photo-frame': {
    optionGroups: [
      { key: 'deity', label: 'Deity photo', values: ['Custom Upload', 'Choose from Gallery'] },
      { key: 'frameStyle', label: 'Frame style', values: ['Classic', 'Carved', 'LED Backlit'] },
      { key: 'size', label: 'Size', values: ['8x10 inch', '12x16 inch', '16x20 inch'] },
      { key: 'finish', label: 'Finish', values: ['Gold Finish', 'Silver Finish', 'Natural Wood'] },
    ],
    photoSlots: 1,
  },

  // ---------- Pen Print ----------
  'pen-print': {
    optionGroups: [
      { key: 'penType', label: 'Pen type', values: ['Ball Pen', 'Metal Pen', 'Premium Roller Pen'] },
      { key: 'printType', label: 'Print type', values: ['Name Print', 'Logo Print', 'Photo Print'] },
      { key: 'color', label: 'Pen color', values: ['Black', 'Silver', 'Gold', 'Blue'] },
      { key: 'quantity', label: 'Quantity', values: ['1 Pc', '10 Pcs', '50 Pcs'] },
    ],
    photoSlots: 1,
  },

  // ---------- Trophy ----------
  'trophy': {
    optionGroups: [
      { key: 'trophyType', label: 'Trophy type', values: ['Cup Trophy', 'Acrylic Trophy', 'Crystal Trophy', 'Wooden Trophy'] },
      { key: 'size', label: 'Size', values: ['Small', 'Medium', 'Large'] },
      { key: 'engraving', label: 'Engraving', values: ['Name + Date', 'Logo + Text', 'Custom Text'] },
      { key: 'base', label: 'Base', values: ['Wood Base', 'Acrylic Base', 'Marble Base'] },
    ],
    photoSlots: 0,
  },
}

export const getCustomizationTemplate = (productType) =>
  customizationTemplates[productType] || {
    optionGroups: [
      { key: 'size', label: 'Size', values: ['Small', 'Medium', 'Large'] },
      { key: 'finish', label: 'Finish', values: ['Glossy', 'Matte'] },
    ],
    photoSlots: 1,
  }

/** Prefer admin-configured groups on the product, else fall back to templates. */
export const getProductCustomizationTemplate = (product) => {
  const fallback = getCustomizationTemplate(product?.productType)
  if (product?.customizationGroups?.length) {
    return {
      optionGroups: product.customizationGroups,
      photoSlots: product.personalization?.maxPhotos || fallback.photoSlots || 1,
      tabs: product.customizationTabs ?? fallback.tabs,
    }
  }
  return fallback
}

export const getDefaultOptions = (productType, product) => {
  const template = product ? getProductCustomizationTemplate(product) : getCustomizationTemplate(productType)
  const fromTemplate = Object.fromEntries(template.optionGroups.map((group) => [group.key, group.values[0]]))
  return { ...fromTemplate, ...(product?.defaultOptions || {}) }
}