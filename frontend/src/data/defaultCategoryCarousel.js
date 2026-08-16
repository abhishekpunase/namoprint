import { normalizeCategoryLink, resolveCategoryLink } from '../config/categoryRoutes'

/** Fallback when API has no items — mirrors backend seed */
const RAW_CATEGORY_CAROUSEL = [
  {
    label: 'Acrylic Wall Photo',
    productType: 'acrylic-wall-photo',
    videoUrl:
      'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766941654703-romtz.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/products?type=acrylic-wall-photo',
  },
  {
    label: 'Acrylic Wall Clock',
    productType: 'custom-wall-watch',
    videoUrl:
      'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766938943981-d5vchq.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1563861826100-9cb088fdbe1c?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/products?type=custom-wall-watch',
  },
  {
    label: 'Baby Frames',
    productType: 'acrylic-photo-frame',
    videoUrl:
      'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766942064646-wtya9i.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1515488042361-ee00e945b422?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/products?type=acrylic-photo-frame',
  },
  {
    label: 'Framed Acrylic Photo',
    productType: 'acrylic-photo-frame',
    videoUrl:
      'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766941654703-romtz.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/products?type=acrylic-photo-frame',
  },
  {
    label: 'Name Plates',
    productType: 'acrylic-name-plate',
    videoUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/products?type=acrylic-name-plate',
  },
  {
    label: 'QR Standee',
    productType: 'logo-stickers',
    videoUrl: 'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1611162617474-5b21e939e113?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/products?type=logo-stickers',
  },
  {
    label: 'Trophies',
    productType: 'trophy',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/products?type=trophy',
  },
  {
    label: 'Corporate Gifts',
    productType: 'corporate-gift-printing',
    videoUrl: 'https://filesamples.com/samples/video/mp4/sample_960x540.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1549460340-1734792b3b0c?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/products?type=corporate-gift-printing',
  },
  {
    label: 'Wedding Card',
    productType: 'uv-dtf-stickers',
    videoUrl: 'https://filesamples.com/samples/video/mp4/sample_1280x720.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/products?type=uv-dtf-stickers',
  },
  {
    label: 'Monogram Plates',
    productType: 'acrylic-monogram-nameplate',
    videoUrl: 'https://filesamples.com/samples/video/mp4/sample_640x360.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/products?type=acrylic-monogram-nameplate',
  },
  {
    label: 'Wooden Photo Frame',
    productType: 'wooden-photo-frame',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1560246700-09c521411a7d?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/products?type=wooden-photo-frame',
  },
  {
    label: 'LED Photo Frame',
    productType: 'led-photo-frame',
    videoUrl:
      'https://rqnknqgpqttjqqhaejmt.supabase.co/storage/v1/object/public/reel-videos/videos/1766938943981-d5vchq.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1531981936561-347fb37a966a?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/products?type=led-photo-frame',
  },
  {
    label: 'Photo Collage',
    productType: 'photo-collage',
    videoUrl: 'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
    posterUrl: '/products/mockups/frame-collage.svg',
    linkUrl: '/products?type=photo-collage',
  },
  {
    label: 'Canvas Print',
    productType: 'canvas-print',
    videoUrl: 'https://filesamples.com/samples/video/mp4/sample_1280x720.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/products?type=canvas-print',
  },
  {
    label: 'God Photo Frame',
    productType: 'god-photo-frame',
    videoUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1604608672516-f1bc809a4e24?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/products?type=god-photo-frame',
  },
  {
    label: 'T-Shirt Printing',
    productType: 't-shirt-printing',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop',
    linkUrl: '/t-shirt-printing',
  },
]

export const DEFAULT_CATEGORY_CAROUSEL = RAW_CATEGORY_CAROUSEL.map((item) => ({
  ...item,
  linkUrl: resolveCategoryLink(item.productType),
}))

export const CATEGORY_PRODUCT_TYPES = [
  { value: 'acrylic-wall-photo', label: 'Acrylic Wall Photo' },
  { value: 'custom-wall-watch', label: 'Wall Watch / Clock' },
  { value: 'acrylic-photo-frame', label: 'Acrylic Photo Frame' },
  { value: 'acrylic-name-plate', label: 'Name Plate' },
  { value: 'acrylic-monogram-nameplate', label: 'Monogram Nameplate' },
  { value: 'logo-stickers', label: 'Logo Stickers' },
  { value: 'uv-dtf-stickers', label: 'UV DTF Stickers' },
  { value: 'trophy', label: 'Trophy' },
  { value: 'corporate-gift-printing', label: 'Corporate Gifts' },
  { value: 'wooden-photo-frame', label: 'Wooden Photo Frame' },
  { value: 'led-photo-frame', label: 'LED Photo Frame' },
  { value: 'photo-collage', label: 'Photo Collage' },
  { value: 'canvas-print', label: 'Canvas Print' },
  { value: 'god-photo-frame', label: 'God Photo Frame' },
  { value: 't-shirt-printing', label: 'T-Shirt Printing' },
  { value: 'personalised-keychain', label: 'Keychain' },
  { value: 'photo-album', label: 'Photo Album' },
  { value: 'luggage-tag', label: 'Luggage Tag' },
  { value: 'product-labels', label: 'Product Labels' },
]

export function mapApiCategoryCarouselItem(item) {
  const productType = item.productType || item.value || ''
  return {
    _id: item._id,
    label: item.label || '',
    value: productType,
    productType,
    video: item.videoUrl || item.video || '',
    poster: item.posterUrl || item.poster || '',
    linkUrl: normalizeCategoryLink({ ...item, productType }),
  }
}
