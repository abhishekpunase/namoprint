/** Fallback when API has no slides — matches initial seed data */
export const DEFAULT_HOME_SLIDES = [
  {
    title: 'Custom Photo\nWall Clocks',
    subtitle: 'Personalize your time',
    priceLabel: 'From ₹499',
    backgroundClass: 'bg-[#FBF0DD]',
    imageUrl: 'https://m.media-amazon.com/images/I/718qXZen-lL.jpg',
    linkUrl: '/custom-wall-watches',
    buttonLabel: 'Shop Now',
  },
  {
    title: 'Custom Printed\nT-Shirts',
    subtitle: 'Wear your story',
    priceLabel: 'From ₹399',
    backgroundClass: 'bg-[#F3E8EE]',
    imageUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80&auto=format&fit=crop',
    linkUrl: '/t-shirt-printing',
    buttonLabel: 'Shop Now',
  },
  {
    title: 'Custom Photo\nFrames',
    subtitle: 'Frame your favorite moments',
    priceLabel: 'From ₹349',
    backgroundClass: 'bg-[#EAF0F6]',
    imageUrl: 'https://www.giftify.in/cdn/shop/files/MiniPhotoFrame1.jpg?v=1696763406',
    linkUrl: '/god-photo-frames',
    buttonLabel: 'Shop Now',
  },
  {
    title: 'Custom Photo\nCushions',
    subtitle: 'Cozy up with your memories',
    priceLabel: 'From ₹449',
    backgroundClass: 'bg-[#F5EDE4]',
    imageUrl:
      'https://d2k16ouylthisj.cloudfront.net/photo_cushion_fur_snowy_white/4.0.0/product_images/web/fur-lined-photo-cushion-1.jpg',
    linkUrl: '/products',
    buttonLabel: 'Shop Now',
  },
  {
    title: 'Custom Photo\nCalendars',
    subtitle: 'Every month, a new memory',
    priceLabel: 'From ₹399',
    backgroundClass: 'bg-[#EDEFE3]',
    imageUrl: 'https://www.photoland.in/wp-content/uploads/2020/02/2026-Calendar-6-H.jpg',
    linkUrl: '/products',
    buttonLabel: 'Shop Now',
  },
]

export const HOME_SLIDE_BG_PRESETS = [
  { label: 'Warm cream', value: 'bg-[#FBF0DD]' },
  { label: 'Soft pink', value: 'bg-[#F3E8EE]' },
  { label: 'Sky blue', value: 'bg-[#EAF0F6]' },
  { label: 'Sand', value: 'bg-[#F5EDE4]' },
  { label: 'Sage', value: 'bg-[#EDEFE3]' },
  { label: 'Mint', value: 'bg-[#E9F1EF]' },
]

export function mapApiSlideToHero(slide) {
  return {
    _id: slide._id,
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    price: slide.priceLabel || '',
    bg: slide.backgroundClass || 'bg-[#FBF0DD]',
    image: slide.imageUrl || '',
    linkUrl: slide.linkUrl || '/products',
    buttonLabel: slide.buttonLabel || 'Shop Now',
  }
}
