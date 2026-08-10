/** Storefront SEO defaults — override site URL via VITE_SITE_URL in .env */
export const SITE_NAME = 'Namo Print'
export const SITE_TAGLINE = 'Custom Photo Frames, Name Plates & T-Shirt Printing'
export const SITE_DESCRIPTION =
  'Namo Print — order custom photo frames, acrylic name plates, god photo frames, and printed t-shirts online. Upload your design, choose size, and get fast delivery across India.'
export const SITE_KEYWORDS =
  'custom photo frames, name plate, house name plate, god photo frame, t-shirt printing, custom t-shirt, photo printing, personalized gifts, Namo Print, India'
export const SITE_LOCALE = 'en_IN'
export const TWITTER_HANDLE = '@namoprint'

export const DEFAULT_OG_IMAGE = '/favicon.svg'

export function getSiteOrigin() {
  const fromEnv = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined') return window.location.origin
  return 'https://namoprint.com'
}

export function absoluteUrl(path = '/') {
  const base = getSiteOrigin()
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

export function buildPageTitle(title) {
  if (!title) return `${SITE_NAME} — ${SITE_TAGLINE}`
  return `${title} | ${SITE_NAME}`
}

/** Storefront meta from admin-filled product.seo with fallbacks */
export function resolveProductSeo(product) {
  if (!product) {
    return { title: '', description: '', keywords: '' }
  }
  const description =
    product.seo?.description ||
    product.description ||
    product.longDescription ||
    `Order ${product.title || 'this product'} online at ${SITE_NAME}.`
  return {
    title: product.seo?.title || product.title || '',
    description,
    keywords: (product.seo?.keywords || []).join(', '),
  }
}

/** Static route SEO — dynamic product pages set their own meta when data loads */
export const ROUTE_SEO = {
  '/': {
    title: 'Custom Photo Frames, Name Plates & T-Shirt Printing',
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
  },
  '/products': {
    title: 'Shop All Products',
    description:
      'Browse custom photo frames, wall clocks, albums, name plates, god frames, and t-shirt printing. Design online and order with easy checkout.',
    keywords: 'shop photo frames, custom prints, personalized products, Namo Print catalog',
  },
  '/god-photo-frames': {
    title: 'God Photo Frames',
    description:
      'Premium god photo frames with custom sizing. Choose quality, upload your photo, and order online with secure checkout.',
    keywords: 'god photo frame, religious frame, custom god frame, temple frame',
  },
  '/name-plates': {
    title: 'Custom Name Plates',
    description:
      'Acrylic and metal house name plates with your family name and address. Weather-resistant, laser-engraved, delivered across India.',
    keywords: 'name plate, house name plate, acrylic name plate, door name plate',
  },
  '/t-shirt-printing': {
    title: 'Custom T-Shirt Printing',
    description:
      'Upload your logo, pick sizes S–XXL, and order custom printed t-shirts for teams, events, and businesses. Per-piece pricing with fast delivery.',
    keywords: 't-shirt printing, custom t-shirt, logo t-shirt, bulk t-shirt printing',
  },
  '/custom-wall-watches': {
    title: 'Custom Wall Watches',
    description:
      'Personalised photo wall clocks — upload your picture, choose dial style and colours. Circle, square round, and square shapes with optional photo collage.',
    keywords: 'custom wall clock, photo wall clock, personalised clock, acrylic wall watch',
  },
  '/pen-print': {
    title: 'Pen Print',
    description: 'Custom printed pens with your name or logo. Ideal for corporate gifting and personal branding.',
    keywords: 'pen print, custom pen, personalized pen, corporate pen',
  },
  '/uv-dtf-stickers': {
    title: 'UV DTF Stickers',
    description: 'Upload your logo and order UV DTF stickers with sharp colours and durable finish.',
    keywords: 'uv dtf stickers, logo stickers, custom stickers',
  },
  '/product-label-stickers': {
    title: 'Product Label Stickers',
    description: 'Print exact-size product labels — upload your artwork and order in bulk.',
    keywords: 'product labels, packaging labels, custom label stickers',
  },
  '/baby-birth-frames': {
    title: 'Baby Birth Frames',
    description: 'Celebrate new arrivals with personalized baby birth photo frames.',
    keywords: 'baby birth frame, newborn frame, personalized baby gift',
  },
  '/corporate-gifts': {
    title: 'Corporate Gifts',
    description: 'Branded corporate gifts and custom printing for teams, events, and clients.',
    keywords: 'corporate gifts, branded gifts, business printing',
  },
  '/trophies': {
    title: 'Trophies & Mementos',
    description: 'Custom trophies and mementos for sports, events, and achievements.',
    keywords: 'trophy, memento, custom trophy, award',
  },
  '/about': {
    title: 'About Us',
    description: 'Learn about Namo Print — your trusted partner for custom printing, photo frames, and personalized gifts.',
  },
  '/contact': {
    title: 'Contact Us',
    description: 'Get in touch with Namo Print for orders, bulk enquiries, and support. We are happy to help.',
  },
  '/bulk-orders': {
    title: 'Bulk Orders',
    description: 'Place bulk orders for photo frames, name plates, and t-shirt printing at special rates.',
  },
  '/faq': {
    title: 'FAQ',
    description: 'Frequently asked questions about ordering, customization, shipping, and payments at Namo Print.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description: 'How Namo Print collects, uses, and protects your personal information.',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions',
    description: 'Terms and conditions for using Namo Print website and placing orders.',
  },
  '/refund-policy': {
    title: 'Refund Policy',
    description: 'Refund and cancellation policy for Namo Print orders.',
  },
  '/shipping-policy': {
    title: 'Shipping Policy',
    description: 'Shipping timelines, delivery areas, and tracking information for Namo Print orders.',
  },
  '/login': {
    title: 'Login',
    description: 'Sign in to your Namo Print account to track orders and checkout faster.',
    noindex: true,
  },
  '/register': {
    title: 'Create Account',
    description: 'Create a Namo Print account to save designs and manage orders.',
    noindex: true,
  },
  '/cart': {
    title: 'Shopping Cart',
    noindex: true,
  },
  '/checkout': {
    title: 'Checkout',
    noindex: true,
  },
  '/wishlist': {
    title: 'Wishlist',
    noindex: true,
  },
  '/account': {
    title: 'My Account',
    noindex: true,
  },
  '/account/orders': {
    title: 'My Orders',
    noindex: true,
  },
}

const DYNAMIC_PREFIXES = [
  '/products/',
  '/god-photo-frames/',
  '/name-plates/',
  '/t-shirt-printing/',
  '/custom-wall-watches/',
  '/pen-print/',
  '/uv-dtf-stickers/',
  '/product-label-stickers/',
  '/baby-birth-frames/',
  '/corporate-gifts/',
  '/trophies/',
  '/category/',
]

export function getStaticRouteSeo(pathname) {
  if (DYNAMIC_PREFIXES.some((prefix) => pathname.startsWith(prefix) && pathname !== prefix.slice(0, -1))) {
    return null
  }
  return ROUTE_SEO[pathname] || null
}

export function buildHomeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: getSiteOrigin(),
        logo: absoluteUrl(DEFAULT_OG_IMAGE),
        description: SITE_DESCRIPTION,
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: getSiteOrigin(),
        description: SITE_DESCRIPTION,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${getSiteOrigin()}/products?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }
}

export function buildProductJsonLd({ name, description, image, url, price, currency = 'INR', availability = 'InStock' }) {
  const payload = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: image ? [image] : undefined,
    url,
    brand: { '@type': 'Brand', name: SITE_NAME },
  }
  if (typeof price === 'number' && price >= 0) {
    payload.offers = {
      '@type': 'Offer',
      price: String(price),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url,
    }
  }
  return payload
}

export function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
