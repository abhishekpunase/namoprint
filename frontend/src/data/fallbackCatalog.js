import { resolveFrameOverlay } from './frameVisuals'

/** Static mockup assets in frontend/public/mockups/ — served at /mockups/... */
export const mockupImages = {
  portrait: '/mockups/frame-portrait.svg',
  square: '/mockups/frame-square.svg',
  aluminium: '/mockups/frame-aluminium.svg',
  collage: '/mockups/frame-collage.svg',
}
// export const homeCategories = [
//   {
//     label: "Acrylic Frame",
//     value: "acrylic-photo-frame",
//     video: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/categories/category-1771123379051-3y1j7y22q1j.mp44",
//     poster: "/categories/acrylic.jpg",
//   },
//   {
//     label: "Wooden Frame",
//     value: "wooden-photo-frame",
//     gif: "https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/categories/category-1771123379051-3y1j7y22q1j.mp44",
//   },
//   {
//     label: "LED Frame",
//     value: "led-photo-frame",
//     video: "/categories/led.mp4",
//     poster: "/categories/led.jpg",
//   },
// ];

// =============================  category slides data code end ==============================================
/**
 * Har category ke apne banner slides — 3-4 images per category.
 * Yahan apni actual banner images ka path daalo: /mockups/banners/<category>/1.jpg etc.
 * Agar kisi category ke liye specific images nahi banayi, to neeche wala getCategoryBanners()
 * automatically us category ke products ki hi images se banner bana dega (fallback).
 */
export const categoryBanners = {
  'wooden-photo-frame': [
    { image: 'https://images.unsplash.com/photo-1560246700-09c521411a7d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Rustic Wooden Frames', subtitle: 'Warm classic finish for every memory' },
    { image: 'https://plus.unsplash.com/premium_photo-1661457725261-e0ecfd76d04e?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Handcrafted Quality', subtitle: 'Solid Sheesham wood' },
    { image: 'https://images.unsplash.com/photo-1669975654023-ab2ca92bf98d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Perfect Gifting Choice', subtitle: 'Wall or table ready' },
  ],
  'acrylic-wall-photo': [
  {
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
    title: 'Crystal Clear Acrylic Prints',
    subtitle: 'Transform your memories into premium wall art'
  },
  {
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop',
    title: 'Modern Home Décor',
    subtitle: 'Elegant acrylic wall photos for every space'
  },
  {
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop',
    title: 'Perfect Gift for Every Occasion',
    subtitle: 'Personalized acrylic prints with vibrant colors'
  },
],
 'led-photo-frame': [
  {
    image: 'https://images.unsplash.com/photo-1531981936561-347fb37a966a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGVkJTIwcGhvdG8lMjBmcmFtfGVufDB8MHwwfHx8MA%3D%3D',
    title: 'Illuminate Your Precious Memories',
    subtitle: 'Premium LED photo frames with warm ambient lighting'
  },
  {
    image: 'https://images.unsplash.com/photo-1542286349-43cbfe53f2b3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'USB Powered & Energy Efficient',
    subtitle: 'Easy plug-and-play design with a beautiful warm white glow'
  },
  {
    image: 'https://images.unsplash.com/photo-1667508867415-0f7f40b5d57e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'A Perfect Gift That Shines',
    subtitle: 'Personalized LED photo frames for birthdays, anniversaries & special moments'
  },
],
 'custom-wall-watch': [
  {
    image: 'https://images.unsplash.com/photo-1531981936561-347fb37a966a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGVkJTIwcGhvdG8lMjBmcmFtfGVufDB8MHwwfHx8MA%3D%3D',
    title: 'Illuminate Your Precious Memories',
    subtitle: 'Premium LED photo frames with warm ambient lighting'
  },
  {
    image: 'https://images.unsplash.com/photo-1542286349-43cbfe53f2b3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'USB Powered & Energy Efficient',
    subtitle: 'Easy plug-and-play design with a beautiful warm white glow'
  },
  {
    image: 'https://images.unsplash.com/photo-1667508867415-0f7f40b5d57e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'A Perfect Gift That Shines',
    subtitle: 'Personalized LED photo frames for birthdays, anniversaries & special moments'
  },
],
}

/**
 * Kisi bhi category ke liye banner slides return karta hai.
 * Agar categoryBanners me manually data nahi diya, to us category ke products
 * ki images se hi 3-4 auto slides bana deta hai — taaki har category pe
 * banner kaam kare, chahe aapne image manually na daali ho.
 */
export function getCategoryBanners(categoryType, categoryLabel) {
  if (categoryBanners[categoryType]?.length) {
    return categoryBanners[categoryType]
  }
  const productsInCategory = fallbackProducts.filter((p) => p.productType === categoryType)
  if (productsInCategory.length) {
    return productsInCategory.slice(0, 4).map((p) => ({
      image: p.images?.[0],
      title: categoryLabel || p.title,
      subtitle: p.description,
    }))
  }
  return [{ image: mockupImages.aluminium, title: categoryLabel || 'Category', subtitle: '' }]
}
// =============================  category slides data code end ==============================================

/** Default thumbnail per productType when images[] is empty or not set */
const productTypeDefaultImage = {
  'acrylic-wall-photo': mockupImages.portrait,
  'custom-wall-watch': mockupImages.square,
  'acrylic-name-plate': mockupImages.aluminium,
  'personalised-keychain': mockupImages.aluminium,
  'acrylic-photo-frame': mockupImages.portrait,
  'photo-album': mockupImages.portrait,
  'acrylic-monogram-nameplate': mockupImages.aluminium,
  'luggage-tag': mockupImages.aluminium,
  'acrylic-photo-mini-wall-gallery': mockupImages.square,
  'acrylic-photo-stand': mockupImages.portrait,
  'uv-dtf-stickers': mockupImages.aluminium,
  'logo-stickers': mockupImages.square,
  'product-labels': mockupImages.aluminium,
  't-shirt-printing': mockupImages.portrait,
  'corporate-gift-printing': mockupImages.aluminium,
  'wooden-photo-frame': mockupImages.portrait,
  'led-photo-frame': mockupImages.portrait,
  'table-photo-frame': mockupImages.portrait,
  'wall-photo-frame': mockupImages.portrait,
  'photo-collage': mockupImages.collage,
  'canvas-print': mockupImages.portrait,
  'photo-clock': mockupImages.square,
  'personalized-wall-art': mockupImages.portrait,
  'temple-photo-frame': mockupImages.portrait,
  'god-photo-frame': mockupImages.portrait,
  'pen-print': mockupImages.aluminium,
  'trophy': mockupImages.aluminium,
}

/** Resolve product thumbnail — home/listing card image (not mockup frame) */
export function getProductImage(product) {
  if (product?.thumbnail) return product.thumbnail
  if (product?.images?.[0]) return product.images[0]
  return productTypeDefaultImage[product?.productType] || mockupImages.aluminium
}

/** Name plates use live product photos — not SVG mockup overlays */
const LIVE_IMAGE_PRODUCT_TYPES = new Set(['acrylic-name-plate', 'acrylic-monogram-nameplate'])

export function getProductBaseImage(product) {
  return product?.mockup?.baseImageUrl || product?.images?.[0] || null
}

export function usesLiveProductImage(product) {
  return LIVE_IMAGE_PRODUCT_TYPES.has(product?.productType) && Boolean(getProductBaseImage(product))
}

/** Frame overlay used inside the product designer (PNG/SVG with transparent photo window) */
export function getProductFrameImage(product, variant, options = {}) {
  if (usesLiveProductImage(product)) return null
  if (product?.mockup?.frameImage) return product.mockup.frameImage
  if (product?.mockup?.photoBoxes?.length && product?.images?.[0]) return product.images[0]
  const resolved = resolveFrameOverlay(product, variant, options)
  if (resolved === null) return null
  if (resolved) return resolved
  const shape = options?.shape || product?.defaultOptions?.shape || ''
  if (
    (product?.productType === 'custom-wall-watch' || product?.productType === 'photo-clock') &&
    shape &&
    !['Circle', 'Square', 'Square Round'].includes(shape)
  ) {
    return null
  }
  return productTypeDefaultImage[product?.productType] || mockupImages.aluminium
}

const withDefaultImages = (products) =>
  products.map((product) => {
    const skipMockupFrame = LIVE_IMAGE_PRODUCT_TYPES.has(product.productType)
    return {
      ...product,
      images: product.images?.length
        ? product.images
        : skipMockupFrame && product.mockup?.baseImageUrl
          ? [product.mockup.baseImageUrl]
          : [productTypeDefaultImage[product.productType] || mockupImages.aluminium],
      mockup: {
        ...product.mockup,
        frameImage: skipMockupFrame
          ? product.mockup?.frameImage || null
          : product.mockup?.frameImage ||
            productTypeDefaultImage[product.productType] ||
            mockupImages.aluminium,
      },
    }
  })

/**
 * Builds the richer "Product Details" content (sections / specs / gallery / badges)
 * that <ProductDetailsTabs> renders below the description — using each product's
 * OWN highlights, variants, and images, so every product shows content that
 * actually matches it instead of generic/random placeholder text or photos.
 *
 * If a product already defines its own `sections` / `specs` / `gallery` / `badges`
 * (e.g. added later from a CMS/admin panel), those are kept as-is and this
 * function is skipped for that field.
 */
const SECTION_EYEBROWS = ['The Material', 'The Craft', 'The Finish', 'The Details']

function buildProductDetails(product) {
  const heroImage = product.images?.[0] || productTypeDefaultImage[product.productType] || mockupImages.aluminium
  const variant = product.variants?.[0] || {}
  const name = product.title

  const highlights = product.highlights?.length
    ? product.highlights
    : ['Premium quality', 'Made to order', 'Gift-ready packaging']

  const sections =
    product.sections?.length
      ? product.sections
      : highlights.slice(0, 4).map((highlight, i) => ({
          eyebrow: SECTION_EYEBROWS[i] || `0${i + 1}`,
          heading: highlight,
          text: `${name} is built around ${highlight.toLowerCase()}. ${product.description}`,
          imageUrl: heroImage,
        }))

  const specs =
    product.specs?.length
      ? product.specs
      : [
          variant.material && { label: 'Material', value: variant.material },
          variant.size && { label: 'Size', value: variant.size },
          variant.frameType && { label: 'Type', value: variant.frameType },
          product.personalization?.allowPhotoUpload &&
            {
              label: 'Personalisation',
              value: product.personalization?.allowText ? 'Photo + custom text' : 'Photo upload',
            },
          product.personalization?.maxPhotos &&
            { label: 'Photo slots', value: `${product.personalization.maxPhotos}` },
          { label: 'Production time', value: '1-2 business days' },
        ].filter(Boolean)

  const gallery = product.gallery?.length ? product.gallery : product.images?.length ? product.images : [heroImage]

  const badges =
    product.badges?.length
      ? product.badges
      : ['Made in India', 'Ready to Hang', 'Fast Delivery', ...(product.personalization?.allowPhotoUpload ? ['Free BG Removal'] : [])]

  return { ...product, sections, specs, gallery, badges }
}

export const productTypes = [
  // Existing
  { label: 'Wall Watches', value: 'custom-wall-watch' },
  { label: 'Acrylic Frames', value: 'acrylic-photo-frame', video: "../assets/video/category/cat-1.mp4", },
  { label: 'Name Plates', value: 'acrylic-name-plate' },
  { label: 'Wall Photos', value: 'acrylic-wall-photo' },
  { label: 'Keychains', value: 'personalised-keychain' },
  { label: 'Photo Albums', value: 'photo-album' },
  { label: 'Monogram Name Plates', value: 'acrylic-monogram-nameplate' },
  { label: 'Luggage Tags', value: 'luggage-tag' },
  { label: 'Mini Wall Gallery', value: 'acrylic-photo-mini-wall-gallery' },
  { label: 'Photo Stands', value: 'acrylic-photo-stand' },

  // Newly added categories
  { label: 'UV DTF Stickers', value: 'uv-dtf-stickers', video: "../assets/video/category/cat-1.mp4",  },
  { label: 'Logo Stickers', value: 'logo-stickers' },
  { label: 'Product Labels', value: 'product-labels' },
  { label: 'T-Shirt Printing', value: 't-shirt-printing' },
  { label: 'Corporate Gift Printing', value: 'corporate-gift-printing' },
  { label: 'Wooden Photo Frame', value: 'wooden-photo-frame' },
  { label: 'LED Photo Frame', value: 'led-photo-frame' },
  { label: 'Table Photo Frame', value: 'table-photo-frame' },
  { label: 'Wall Photo Frame', value: 'wall-photo-frame' },
  { label: 'Photo Collage', value: 'photo-collage' },
  { label: 'Canvas Print', value: 'canvas-print' },
  { label: 'Photo Clock', value: 'photo-clock' },
  { label: 'Personalized Wall Art', value: 'personalized-wall-art' },
  { label: 'Temple Photo Frame', value: 'temple-photo-frame' },
  { label: 'God Photo Frame', value: 'god-photo-frame' },
  { label: 'Pen Print', value: 'pen-print' },
  { label: 'Trophy', value: 'trophy' },
]

/** Hidden from /products category chips — these have dedicated storefront pages or are retired from catalog filters */
export const CATALOG_HIDDEN_PRODUCT_TYPES = new Set([
  'temple-photo-frame',
  'god-photo-frame',
  'pen-print',
  'trophy',
  'personalized-wall-art',
  'corporate-gift-printing',
  't-shirt-printing',
  'acrylic-monogram-nameplate',
  'personalised-keychain',
  'luggage-tag',
  'canvas-print',
  'acrylic-name-plate',
  'photo-album',
  'logo-stickers',
  'product-labels',
  'uv-dtf-stickers',
  'product-labels',
])

export const catalogProductTypes = productTypes.filter(
  (type) => !CATALOG_HIDDEN_PRODUCT_TYPES.has(type.value),
)
/** Live preview videos — verified working URLs (206/200 on range request) */
const CATEGORY_VIDEOS = {
  // Product reels (Supabase — live)
  wallPhoto:
    'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766941654703-romtz.mp4',
  wallClock:
    'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766938943981-d5vchq.mp4',
  babyFrame:
    'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766942064646-wtya9i.mp4',
  framedPhoto:
    'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766941654703-romtz.mp4',
  // Verified public CDNs
  namePlate:
    'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
  qrStandee:
    'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
  trophy:
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
  corporateGift:
    'https://filesamples.com/samples/video/mp4/sample_960x540.mp4',
  weddingCard:
    'https://filesamples.com/samples/video/mp4/sample_1280x720.mp4',
  monogram:
    'https://filesamples.com/samples/video/mp4/sample_640x360.mp4',
  woodenFrame:
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
  ledFrame:
    'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766938943981-d5vchq.mp4',
  photoCollage:
    'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
  canvasPrint:
    'https://filesamples.com/samples/video/mp4/sample_1280x720.mp4',
  godFrame:
    'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
  tshirt:
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
}

export const homeCategories = [
  {
    label: 'Acrylic Wall Photo',
    value: 'acrylic-wall-photo',
    video: CATEGORY_VIDEOS.wallPhoto,
    poster: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Acrylic Wall Clock',
    value: 'custom-wall-watch',
    video: CATEGORY_VIDEOS.wallClock,
    poster: 'https://images.unsplash.com/photo-1563861826100-9cb088fdbe1c?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Baby Frames',
    value: 'acrylic-photo-frame',
    video: CATEGORY_VIDEOS.babyFrame,
    poster: 'https://images.unsplash.com/photo-1515488042361-ee00e945b422?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Framed Acrylic Photo',
    value: 'acrylic-photo-frame',
    video: CATEGORY_VIDEOS.framedPhoto,
    poster: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Name Plates',
    value: 'acrylic-name-plate',
    video: CATEGORY_VIDEOS.namePlate,
    poster: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'QR Standee',
    value: 'logo-stickers',
    video: CATEGORY_VIDEOS.qrStandee,
    poster: 'https://images.unsplash.com/photo-1611162617474-5b21e939e113?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Trophies',
    value: 'trophy',
    video: CATEGORY_VIDEOS.trophy,
    poster: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Corporate Gifts',
    value: 'corporate-gift-printing',
    video: CATEGORY_VIDEOS.corporateGift,
    poster: 'https://images.unsplash.com/photo-1549460340-1734792b3b0c?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Wedding Card',
    value: 'uv-dtf-stickers',
    video: CATEGORY_VIDEOS.weddingCard,
    poster: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Monogram Plates',
    value: 'acrylic-monogram-nameplate',
    video: CATEGORY_VIDEOS.monogram,
    poster: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Wooden Photo Frame',
    value: 'wooden-photo-frame',
    video: CATEGORY_VIDEOS.woodenFrame,
    poster: 'https://images.unsplash.com/photo-1560246700-09c521411a7d?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'LED Photo Frame',
    value: 'led-photo-frame',
    video: CATEGORY_VIDEOS.ledFrame,
    poster: 'https://images.unsplash.com/photo-1531981936561-347fb37a966a?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'Photo Collage',
    value: 'photo-collage',
    video: CATEGORY_VIDEOS.photoCollage,
    poster: productTypeDefaultImage['photo-collage'] || mockupImages.collage,
  },
  {
    label: 'Canvas Print',
    value: 'canvas-print',
    video: CATEGORY_VIDEOS.canvasPrint,
    poster: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'God Photo Frame',
    value: 'god-photo-frame',
    video: CATEGORY_VIDEOS.godFrame,
    poster: 'https://images.unsplash.com/photo-1604608672516-f1bc809a4e24?q=80&w=400&auto=format&fit=crop',
  },
  {
    label: 'T-Shirt Printing',
    value: 't-shirt-printing',
    video: CATEGORY_VIDEOS.tshirt,
    poster: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop',
  },
].map((cat) => ({
  ...cat,
  poster: cat.poster || productTypeDefaultImage[cat.value] || mockupImages.aluminium,
}))

const rawFallbackProducts = [
  // ---------------- existing (kept as-is) ----------------
  {
    _id: 'demo-wall-photo',
    title: 'Premium Acrylic Wall Photo Portrait',
    slug: 'premium-acrylic-wall-photo-portrait',
    productType: 'acrylic-wall-photo',
    description: 'High-gloss acrylic portrait print made for sharp, gift-ready wall decor.',
    highlights: ['HD acrylic shine', 'Ready to hang', 'Water resistant finish'],
    // Custom image override — leave [] to auto-use productType default from mockupImages
    images: [mockupImages.portrait],
    isFeatured: true,
    mockup: {
      canvas: { width: 1000, height: 1250 },
      photoBox: { x: 90, y: 80, width: 820, height: 1090, rotate: 0, borderRadius: 18 },
      frameImage: mockupImages.portrait,
    },
    personalization: { allowPhotoUpload: true, allowText: true, textFields: ['caption'] },
    variants: [
      { _id: 'demo-wall-photo-8x12', sku: 'AWP-POR-8X12-3MM', size: '8x12 inch', material: '3mm Acrylic', frameType: 'No Frame', price: 699, compareAtPrice: 999, stock: 100 },
      { _id: 'demo-wall-photo-12x18', sku: 'AWP-POR-12X18-5MM', size: '12x18 inch', material: '5mm Acrylic', frameType: 'Dual Border', price: 1299, compareAtPrice: 1899, stock: 75 },
    ],
  },
  {
    _id: 'demo-clock',
    title: 'Square Round Acrylic Photo Wall Clock',
    slug: 'square-round-acrylic-photo-wall-clock',
    productType: 'custom-wall-watch',
    description: 'Personalised wall clock with a clean dial and your favourite family photo.',
    highlights: ['Silent movement', 'Photo dial', 'Gift packaging'],
    images: [],
    isFeatured: true,
    mockup: {
      canvas: { width: 1000, height: 1000 },
      photoBox: { x: 90, y: 90, width: 820, height: 820, rotate: 0, borderRadius: 410 },
      frameImage: mockupImages.square,
    },
    personalization: { allowPhotoUpload: true, allowText: false },
    variants: [
      { _id: 'demo-clock-10', sku: 'CWW-ROUND-10', size: '10 inch', material: 'Acrylic', frameType: 'Round', price: 899, compareAtPrice: 1299, stock: 60 },
    ],
  },
  {
    _id: 'demo-clock-circle',
    title: 'Circle Acrylic Photo Wall Clock',
    slug: 'circle-acrylic-photo-wall-clock',
    productType: 'custom-wall-watch',
    description: 'Round acrylic photo clock for clean modern home gifting.',
    highlights: ['Circle cut', 'HD print', 'Silent movement'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 1000, height: 1000 }, photoBox: { x: 145, y: 145, width: 710, height: 710, rotate: 0, borderRadius: 355 } },
    personalization: { allowPhotoUpload: true, allowText: false },
    variants: [
      { _id: 'demo-clock-circle-12', sku: 'CWW-CIRCLE-12', size: '12 inch', material: 'Acrylic', frameType: 'Circle', price: 949, compareAtPrice: 1299, stock: 70 },
    ],
    defaultOptions: { shape: 'Circle', clockHands: 'Classic Silver', size: '12 inch', dialStyle: 'Modern Numbers' },
  },
  {
    _id: 'demo-clock-collage',
    title: 'Four Photo Collage Wall Clock',
    slug: 'four-photo-collage-wall-clock',
    productType: 'custom-wall-watch',
    description: 'Four-photo collage clock with separate upload zones for every quarter.',
    highlights: ['4 photo slots', 'Collage dial', 'Silent movement'],
    images: [],
    isFeatured: false,
    mockup: {
      canvas: { width: 1024, height: 1536 },
      frameImage: '/mockups/frame-collage.svg',
      photoBoxes: [
        { id: 1, x: 75, y: 95, width: 515, height: 550 },
        { id: 2, x: 300, y: 500, width: 530, height: 440 },
        { id: 3, x: 515, y: 940, width: 440, height: 390 },
      ],
    },
    personalization: { allowPhotoUpload: true, maxPhotos: 3, allowText: false },
    variants: [
      { _id: 'demo-clock-collage-12', sku: 'CWW-COLLAGE-12', size: '12 inch', material: 'Acrylic', frameType: 'Collage', price: 1199, compareAtPrice: 1699, stock: 45 },
    ],
    defaultOptions: { shape: 'Four Photo Collage', clockHands: 'Classic Silver', size: '12 inch', dialStyle: 'Modern Numbers' },
  },
  {
    _id: 'demo-nameplate',
    title: 'Modern Acrylic House Name Plate',
    slug: 'modern-acrylic-house-name-plate',
    productType: 'acrylic-name-plate',
    description: 'Minimal name plate with premium acrylic layers and crisp typography.',
    highlights: ['Weather friendly', 'Custom text', 'Easy mounting'],
    images: ['/products/name-plate-live.png'],
    isFeatured: false,
    mockup: {
      canvas: { width: 1000, height: 1000 },
      baseImageUrl: '/products/name-plate-live.png',
    },
    personalization: { allowPhotoUpload: false, allowText: true, textFields: ['familyName', 'addressLine'] },
    variants: [
      { _id: 'demo-nameplate-12', sku: 'ANP-12X6', size: '12x6 inch', material: '5mm Acrylic', frameType: 'Layered', price: 1199, compareAtPrice: 1699, stock: 45 },
    ],
  },
  {
    _id: 'demo-keychain',
    title: 'Personalised Couple Keychain',
    slug: 'personalised-couple-keychain',
    productType: 'personalised-keychain',
    description: 'Pocket-sized custom photo keepsake with a glossy acrylic finish.',
    highlights: ['Double side print', 'Lightweight', 'Fast gifting pick'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 900, height: 900 }, photoBox: { x: 210, y: 150, width: 480, height: 560, rotate: 0, borderRadius: 42 } },
    personalization: { allowPhotoUpload: true, allowText: true, textFields: ['name'] },
    variants: [
      { _id: 'demo-keychain-heart', sku: 'PKC-HEART', size: 'Heart', material: 'Acrylic', frameType: 'Metal ring', price: 249, compareAtPrice: 399, stock: 200 },
    ],
  },

  // ---------------- newly added product details ----------------
  {
    _id: 'demo-photo-frame',
    title: 'Classic Acrylic Photo Frame',
    slug: 'classic-acrylic-photo-frame',
    productType: 'acrylic-photo-frame',
    description: 'Sleek acrylic frame with crystal-clear edges, perfect for desk or wall display.',
    highlights: ['Crystal clear edges', 'Scratch resistant', 'Free standing or hangable'],
    images: [],
    isFeatured: true,
    mockup: { canvas: { width: 1000, height: 1200 }, photoBox: { x: 100, y: 100, width: 800, height: 1000, rotate: 0, borderRadius: 12 } },
    personalization: { allowPhotoUpload: true, allowText: true, textFields: ['caption'] },
    variants: [
      { _id: 'demo-photo-frame-8x10', sku: 'APF-8X10-4MM', size: '8x10 inch', material: '4mm Acrylic', frameType: 'Floating', price: 599, compareAtPrice: 899, stock: 90 },
      { _id: 'demo-photo-frame-12x16', sku: 'APF-12X16-5MM', size: '12x16 inch', material: '5mm Acrylic', frameType: 'Floating', price: 999, compareAtPrice: 1499, stock: 60 },
    ],
  },
  {
    _id: 'demo-photo-album',
    title: 'Premium Leather Photo Album',
    slug: 'premium-leather-photo-album',
    productType: 'photo-album',
    description: 'Handbound photo album with a personalised cover photo and premium matte pages.',
    highlights: ['30 matte pages', 'Custom cover photo', 'Gift box included'],
    images: [],
    isFeatured: true,
    mockup: { canvas: { width: 1000, height: 800 }, photoBox: { x: 120, y: 100, width: 760, height: 600, rotate: 0, borderRadius: 10 } },
    personalization: { allowPhotoUpload: true, maxPhotos: 30, allowText: true, textFields: ['title'] },
    variants: [
      { _id: 'demo-photo-album-a4', sku: 'PAL-A4-30P', size: 'A4', material: 'Leatherette', frameType: 'Hardbound', price: 1499, compareAtPrice: 1999, stock: 40 },
      { _id: 'demo-photo-album-a5', sku: 'PAL-A5-20P', size: 'A5', material: 'Leatherette', frameType: 'Hardbound', price: 999, compareAtPrice: 1399, stock: 55 },
    ],
  },
  {
    _id: 'demo-monogram-nameplate',
    title: 'Monogram Initial Acrylic Name Plate',
    slug: 'monogram-initial-acrylic-name-plate',
    productType: 'acrylic-monogram-nameplate',
    description: 'Elegant monogram design with layered acrylic and backlit-ready mounting.',
    highlights: ['Initial based design', 'Layered acrylic', 'Backlit option'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 1000, height: 600 }, photoBox: { x: 150, y: 100, width: 700, height: 400, rotate: 0, borderRadius: 20 } },
    personalization: { allowPhotoUpload: false, allowText: true, textFields: ['initials', 'familyName'] },
    variants: [
      { _id: 'demo-monogram-nameplate-10', sku: 'AMN-10X6', size: '10x6 inch', material: '5mm Acrylic', frameType: 'Layered', price: 1099, compareAtPrice: 1499, stock: 35 },
    ],
  },
  {
    _id: 'demo-luggage-tag',
    title: 'Personalised Acrylic Luggage Tag',
    slug: 'personalised-acrylic-luggage-tag',
    productType: 'luggage-tag',
    description: 'Durable travel tag with your photo and contact details, strap included.',
    highlights: ['Durable strap', 'Water resistant print', 'Fits all bag types'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 700, height: 450 }, photoBox: { x: 60, y: 60, width: 340, height: 330, rotate: 0, borderRadius: 16 } },
    personalization: { allowPhotoUpload: true, allowText: true, textFields: ['name', 'phone'] },
    variants: [
      { _id: 'demo-luggage-tag-std', sku: 'LGT-STD', size: '4x2.5 inch', material: 'Acrylic', frameType: 'Strap', price: 199, compareAtPrice: 349, stock: 250 },
    ],
  },
  {
    _id: 'demo-mini-wall-gallery',
    title: 'Acrylic Mini Wall Gallery Set of 6',
    slug: 'acrylic-mini-wall-gallery-set-of-6',
    productType: 'acrylic-photo-mini-wall-gallery',
    description: 'A curated set of six mini acrylic photo panels to build your own wall gallery.',
    highlights: ['Set of 6 panels', 'Free layout guide', 'Easy peel-stick mounting'],
    images: [],
    isFeatured: true,
    mockup: { canvas: { width: 1200, height: 900 }, photoBox: { x: 100, y: 100, width: 1000, height: 700, rotate: 0, borderRadius: 14 } },
    personalization: { allowPhotoUpload: true, maxPhotos: 6, allowText: false },
    variants: [
      { _id: 'demo-mini-wall-gallery-6x6', sku: 'AMG-6X6-SET6', size: '6x6 inch (x6)', material: '3mm Acrylic', frameType: 'No Frame', price: 1599, compareAtPrice: 2299, stock: 30 },
    ],
  },
  {
    _id: 'demo-photo-stand',
    title: 'Acrylic Photo Stand with Base',
    slug: 'acrylic-photo-stand-with-base',
    productType: 'acrylic-photo-stand',
    description: 'Free-standing acrylic photo block ideal for desks and table tops.',
    highlights: ['Sturdy base', 'Compact desk size', 'Vivid colour print'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 800, height: 1000 }, photoBox: { x: 90, y: 90, width: 620, height: 780, rotate: 0, borderRadius: 14 } },
    personalization: { allowPhotoUpload: true, allowText: false },
    variants: [
      { _id: 'demo-photo-stand-6x8', sku: 'APS-6X8-8MM', size: '6x8 inch', material: '8mm Acrylic', frameType: 'Stand Base', price: 549, compareAtPrice: 799, stock: 80 },
    ],
  },
  {
    _id: 'demo-uv-dtf-stickers',
    title: 'Custom UV DTF Stickers Sheet',
    slug: 'custom-uv-dtf-stickers-sheet',
    productType: 'uv-dtf-stickers',
    description: 'Waterproof, glossy UV DTF stickers custom printed to your design, sold per sheet.',
    highlights: ['Waterproof & glossy', 'Peel and stick', 'Any shape cut'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 900, height: 900 }, photoBox: { x: 100, y: 100, width: 700, height: 700, rotate: 0, borderRadius: 8 } },
    personalization: { allowPhotoUpload: true, allowText: true, textFields: ['label'] },
    variants: [
      { _id: 'demo-uv-dtf-a4', sku: 'UVD-A4-SHEET', size: 'A4 Sheet', material: 'UV DTF Film', frameType: 'Sheet', price: 349, compareAtPrice: 499, stock: 150 },
    ],
  },
  {
    _id: 'demo-logo-stickers',
    title: 'Custom Logo Stickers Pack',
    slug: 'custom-logo-stickers-pack',
    productType: 'logo-stickers',
    description: 'Branded logo stickers for packaging, laptops, and product finishing touches.',
    highlights: ['Vivid colour logo', 'Pack of 50', 'Matte or glossy finish'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 800, height: 800 }, photoBox: { x: 150, y: 150, width: 500, height: 500, rotate: 0, borderRadius: 250 } },
    personalization: { allowPhotoUpload: true, allowText: true, textFields: ['brandName'] },
    variants: [
      { _id: 'demo-logo-stickers-2in-50', sku: 'LGS-2IN-50PK', size: '2 inch (x50)', material: 'Vinyl', frameType: 'Die Cut', price: 299, compareAtPrice: 449, stock: 120 },
    ],
  },
  {
    _id: 'demo-product-labels',
    title: 'Custom Product Labels Roll',
    slug: 'custom-product-labels-roll',
    productType: 'product-labels',
    description: 'Durable adhesive product labels for branding bottles, boxes and jars.',
    highlights: ['Oil & water resistant', 'Roll of 100', 'Custom shape and size'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 900, height: 500 }, photoBox: { x: 100, y: 100, width: 700, height: 300, rotate: 0, borderRadius: 10 } },
    personalization: { allowPhotoUpload: true, allowText: true, textFields: ['productName', 'details'] },
    variants: [
      { _id: 'demo-product-labels-3x2-100', sku: 'PDL-3X2-100PK', size: '3x2 inch (x100)', material: 'Vinyl', frameType: 'Roll', price: 449, compareAtPrice: 649, stock: 100 },
    ],
  },
  {
    _id: 'demo-tshirt-printing',
    title: 'Custom Photo & Text T-Shirt',
    slug: 'custom-photo-text-t-shirt',
    productType: 't-shirt-printing',
    description: 'Soft cotton t-shirt printed with your photo or custom text design.',
    highlights: ['100% cotton', 'Fade resistant print', 'Unisex fit'],
    images: [],
    isFeatured: true,
    mockup: { canvas: { width: 900, height: 1100 }, photoBox: { x: 220, y: 260, width: 460, height: 460, rotate: 0, borderRadius: 12 } },
    personalization: { allowPhotoUpload: true, allowText: true, textFields: ['caption'] },
    variants: [
      { _id: 'demo-tshirt-m', sku: 'TSH-M-COTTON', size: 'M', material: 'Cotton', frameType: 'Round Neck', price: 399, compareAtPrice: 599, stock: 150 },
      { _id: 'demo-tshirt-l', sku: 'TSH-L-COTTON', size: 'L', material: 'Cotton', frameType: 'Round Neck', price: 399, compareAtPrice: 599, stock: 150 },
      { _id: 'demo-tshirt-xl', sku: 'TSH-XL-COTTON', size: 'XL', material: 'Cotton', frameType: 'Round Neck', price: 429, compareAtPrice: 629, stock: 100 },
    ],
  },
  {
    _id: 'demo-corporate-gift',
    title: 'Corporate Branded Gift Combo',
    slug: 'corporate-branded-gift-combo',
    productType: 'corporate-gift-printing',
    description: 'Logo-branded corporate gift combo for employee and client appreciation.',
    highlights: ['Bulk order friendly', 'Logo + text engraving', 'Premium packaging'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 1000, height: 800 }, photoBox: { x: 150, y: 150, width: 700, height: 500, rotate: 0, borderRadius: 16 } },
    personalization: { allowPhotoUpload: true, allowText: true, textFields: ['companyName', 'employeeName'] },
    variants: [
      { _id: 'demo-corporate-gift-standard', sku: 'CGP-COMBO-STD', size: 'Standard Combo', material: 'Mixed', frameType: 'Gift Box', price: 799, compareAtPrice: 1199, stock: 60 },
    ],
  },
  {
    _id: 'demo-wooden-photo-frame',
    title: 'Rustic Wooden Photo Frame',
    slug: 'rustic-wooden-photo-frame',
    productType: 'wooden-photo-frame',
    description: 'Warm rustic wooden frame that adds a classic touch to your favourite memory.',
    highlights: ['Solid wood finish', 'Wall or table use', 'Non-glare glass'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 1000, height: 1200 }, photoBox: { x: 110, y: 110, width: 780, height: 980, rotate: 0, borderRadius: 8 } },
    personalization: { allowPhotoUpload: true, allowText: false },
    variants: [
      { _id: 'demo-wooden-frame-8x10', sku: 'WPF-8X10', size: '8x10 inch', material: 'Sheesham Wood', frameType: 'Classic', price: 749, compareAtPrice: 1099, stock: 55 },
    ],
  },
  {
    _id: 'demo-led-photo-frame',
    title: 'LED Backlit Photo Frame',
    slug: 'led-backlit-photo-frame',
    productType: 'led-photo-frame',
    description: 'Photo frame with soft LED backlighting for a glowing display effect.',
    highlights: ['LED backlight', 'USB powered', 'Warm white glow'],
    images: [],
    isFeatured: true,
    mockup: { canvas: { width: 1000, height: 1000 }, photoBox: { x: 130, y: 130, width: 740, height: 740, rotate: 0, borderRadius: 14 } },
    personalization: { allowPhotoUpload: true, allowText: true, textFields: ['caption'] },
    variants: [
      { _id: 'demo-led-frame-10x10', sku: 'LPF-10X10-LED', size: '10x10 inch', material: 'Acrylic + LED', frameType: 'Backlit', price: 1299, compareAtPrice: 1799, stock: 40 },
    ],
  },
  {
    _id: 'demo-table-photo-frame',
    title: 'Compact Table Photo Frame',
    slug: 'compact-table-photo-frame',
    productType: 'table-photo-frame',
    description: 'Small elegant frame designed to sit neatly on a table or office desk.',
    highlights: ['Compact size', 'Anti-slip base', 'Scratch resistant'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 700, height: 900 }, photoBox: { x: 80, y: 80, width: 540, height: 700, rotate: 0, borderRadius: 10 } },
    personalization: { allowPhotoUpload: true, allowText: false },
    variants: [
      { _id: 'demo-table-frame-5x7', sku: 'TPF-5X7', size: '5x7 inch', material: 'Acrylic', frameType: 'Stand Base', price: 349, compareAtPrice: 549, stock: 100 },
    ],
  },
  {
    _id: 'demo-wall-photo-frame',
    title: 'Elegant Wall Photo Frame',
    slug: 'elegant-wall-photo-frame',
    productType: 'wall-photo-frame',
    description: 'Timeless wall frame for showcasing your favourite family portraits.',
    highlights: ['Ready to hang', 'Premium border', 'Multiple sizes'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 1000, height: 1300 }, photoBox: { x: 100, y: 100, width: 800, height: 1100, rotate: 0, borderRadius: 10 } },
    personalization: { allowPhotoUpload: true, allowText: false },
    variants: [
      { _id: 'demo-wall-frame-10x14', sku: 'WLF-10X14', size: '10x14 inch', material: 'Wood + Glass', frameType: 'Classic', price: 899, compareAtPrice: 1299, stock: 50 },
    ],
  },
  {
    _id: 'demo-photo-collage',
    title: 'Multi Photo Collage Frame',
    slug: 'multi-photo-collage-frame',
    productType: 'photo-collage',
    description: 'A single frame that beautifully arranges multiple photos into one collage.',
    highlights: ['Holds up to 9 photos', 'Custom layout', 'Wall mount ready'],
    images: [],
    isFeatured: true,
   mockup: {
  canvas: { width: 1024, height: 1536 },
  frameImage: '/mockups/frame-collage.svg',
  photoBoxes: [
    { id: 1, x: 75, y: 95, width: 515, height: 550 },
    { id: 2, x: 300, y: 500, width: 530, height: 440 },
    { id: 3, x: 515, y: 940, width: 440, height: 390 },
  ],
},
    personalization: { allowPhotoUpload: true, maxPhotos: 3, allowText: false },
    variants: [
      { _id: 'demo-photo-collage-16x16', sku: 'PCG-16X16-9P', size: '16x16 inch', material: 'Acrylic', frameType: 'Collage', price: 1599, compareAtPrice: 2199, stock: 35 },
    ],
  },
  {
    _id: 'demo-canvas-print',
    title: 'Gallery Wrapped Canvas Print',
    slug: 'gallery-wrapped-canvas-print',
    productType: 'canvas-print',
    description: 'Museum quality canvas print stretched over a wooden frame, ready to hang.',
    highlights: ['Gallery wrap finish', 'Fade resistant ink', 'Ready to hang'],
    images: [],
    isFeatured: true,
    mockup: { canvas: { width: 1200, height: 900 }, photoBox: { x: 60, y: 60, width: 1080, height: 780, rotate: 0, borderRadius: 6 } },
    personalization: { allowPhotoUpload: true, allowText: false },
    variants: [
      { _id: 'demo-canvas-16x20', sku: 'CNV-16X20', size: '16x20 inch', material: 'Canvas', frameType: 'Gallery Wrap', price: 1299, compareAtPrice: 1899, stock: 40 },
    ],
  },
  {
    _id: 'demo-photo-clock',
    title: 'Modern Photo Wall Clock',
    slug: 'modern-photo-wall-clock',
    productType: 'photo-clock',
    description: 'A modern square photo clock combining timekeeping with your favourite memory.',
    highlights: ['Silent sweep movement', 'Sharp photo print', 'Easy wall mount'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 1000, height: 1000 }, photoBox: { x: 150, y: 150, width: 700, height: 700, rotate: 0, borderRadius: 20 } },
    personalization: { allowPhotoUpload: true, allowText: false },
    variants: [
      { _id: 'demo-photo-clock-12', sku: 'PCL-SQ-12', size: '12 inch', material: 'Acrylic', frameType: 'Square', price: 949, compareAtPrice: 1349, stock: 55 },
    ],
    defaultOptions: { shape: 'Square', clockHands: 'Classic Silver', size: '12 inch', dialStyle: 'Minimal Numbers', numberStyle: 'Modern' },
  },
  {
    _id: 'demo-personalized-wall-art',
    title: 'Personalized Family Name Wall Art',
    slug: 'personalized-family-name-wall-art',
    productType: 'personalized-wall-art',
    description: 'Custom wall art combining family names and a favourite photo for home decor.',
    highlights: ['Custom name text', 'Home decor ready', 'Premium acrylic layers'],
    images: [],
    isFeatured: true,
    mockup: { canvas: { width: 1200, height: 800 }, photoBox: { x: 100, y: 100, width: 1000, height: 600, rotate: 0, borderRadius: 16 } },
    personalization: { allowPhotoUpload: true, allowText: true, textFields: ['familyName', 'quote'] },
    variants: [
      { _id: 'demo-wall-art-18x12', sku: 'PWA-18X12', size: '18x12 inch', material: '5mm Acrylic', frameType: 'No Frame', price: 1399, compareAtPrice: 1999, stock: 30 },
    ],
  },
  {
    _id: 'demo-temple-photo-frame',
    title: 'Temple Style Photo Frame',
    slug: 'temple-style-photo-frame',
    productType: 'temple-photo-frame',
    description: 'Ornate temple-inspired frame designed for sacred family photographs.',
    highlights: ['Ornate temple border', 'Rich finish', 'Wall or table use'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 900, height: 1200 }, photoBox: { x: 120, y: 160, width: 660, height: 880, rotate: 0, borderRadius: 30 } },
    personalization: { allowPhotoUpload: true, allowText: false },
    variants: [
      { _id: 'demo-temple-frame-10x14', sku: 'TPF-TEMPLE-10X14', size: '10x14 inch', material: 'Wood + Acrylic', frameType: 'Temple', price: 999, compareAtPrice: 1499, stock: 35 },
    ],
  },
  {
    _id: 'demo-god-photo-frame',
    title: 'God Photo Frame with Prayer Border',
    slug: 'god-photo-frame-with-prayer-border',
    productType: 'god-photo-frame',
    description: 'Devotional photo frame designed to hold god and family photos together.',
    highlights: ['Devotional design', 'Multiple photo slots', 'Gold accent border'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 1000, height: 1200 }, photoBox: { x: 100, y: 120, width: 800, height: 960, rotate: 0, borderRadius: 20 } },
    personalization: { allowPhotoUpload: true, maxPhotos: 2, allowText: false },
    variants: [
      { _id: 'demo-god-frame-10x12', sku: 'GPF-10X12', size: '10x12 inch', material: 'Wood + Acrylic', frameType: 'Devotional', price: 899, compareAtPrice: 1299, stock: 45 },
    ],
  },
  {
    _id: 'demo-pen-print',
    title: 'Custom Photo Print Pen',
    slug: 'custom-photo-print-pen',
    productType: 'pen-print',
    description: 'Elegant metal pen with a personalised photo or name wrap, great gifting pick.',
    highlights: ['Smooth writing ink', 'Custom photo wrap', 'Gift box included'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 400, height: 1200 }, photoBox: { x: 40, y: 100, width: 320, height: 1000, rotate: 0, borderRadius: 30 } },
    personalization: { allowPhotoUpload: true, allowText: true, textFields: ['name'] },
    variants: [
      { _id: 'demo-pen-print-metal', sku: 'PNP-METAL', size: 'Standard', material: 'Metal Body', frameType: 'Ball Pen', price: 199, compareAtPrice: 299, stock: 200 },
    ],
  },
  {
    _id: 'demo-trophy',
    title: 'Custom Engraved Acrylic Trophy',
    slug: 'custom-engraved-acrylic-trophy',
    productType: 'trophy',
    description: 'Personalised acrylic trophy with laser engraving for awards and recognitions.',
    highlights: ['Laser engraved text', 'Sturdy base', 'Premium gift finish'],
    images: [],
    isFeatured: false,
    mockup: { canvas: { width: 700, height: 1000 }, photoBox: { x: 100, y: 150, width: 500, height: 700, rotate: 0, borderRadius: 12 } },
    personalization: { allowPhotoUpload: false, allowText: true, textFields: ['recipientName', 'awardTitle'] },
    variants: [
      { _id: 'demo-trophy-8in', sku: 'TRP-8IN', size: '8 inch', material: 'Acrylic', frameType: 'Standing Base', price: 649, compareAtPrice: 949, stock: 60 },
    ],
  },
]

export const fallbackProducts = withDefaultImages(rawFallbackProducts).map(buildProductDetails)