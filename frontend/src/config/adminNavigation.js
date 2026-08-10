import {
  Activity,
  BarChart3,
  Bell,
  ImageIcon,
  LayoutTemplate,
  Megaphone,
  MessageSquareQuote,
  LayoutDashboard,
  LogOut,
  Package,
  CircleDot,
  Clapperboard,
  Plug,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  Tags,
  Ticket,
  UserCircle,
  UserCog,
  Users,
  Warehouse,
} from 'lucide-react'

export const adminNavigation = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    to: '/admin',
    icon: LayoutDashboard,
    end: true,
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    children: [
      { id: 'products-all', label: 'All Products', to: '/admin/products' },
      { id: 'products-god', label: 'God Photo Frames', to: '/admin/god-photo-frames' },
      { id: 'products-nameplate', label: 'Name Plates', to: '/admin/name-plates' },
      { id: 'products-penprint', label: 'Pen Print', to: '/admin/pen-print' },
      { id: 'products-uvdtf', label: 'UV DTF Stickers', to: '/admin/uv-dtf-stickers' },
      { id: 'products-productlabel', label: 'Product Label Stickers', to: '/admin/product-label-stickers' },
      { id: 'products-corporate', label: 'Corporate Gifts', to: '/admin/corporate-gifts' },
      { id: 'products-babybirth', label: 'Baby Birth Frames', to: '/admin/baby-birth-frames' },
      { id: 'products-trophy', label: 'Trophies', to: '/admin/trophies' },
      { id: 'products-tshirt', label: 'T-Shirt Print', to: '/admin/t-shirt-printing' },
      { id: 'products-wallwatch', label: 'Wall Watches', to: '/admin/wall-watches' },
    ],
  },
  {
    id: 'categories',
    label: 'Categories',
    to: '/admin/categories',
    icon: Tags,
  },
  {
    id: 'orders',
    label: 'Orders',
    to: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    id: 'customers',
    label: 'Customers',
    to: '/admin/customers',
    icon: Users,
  },
  {
    id: 'inventory',
    label: 'Inventory',
    to: '/admin/inventory',
    icon: Warehouse,
  },
  {
    id: 'coupons',
    label: 'Coupons',
    to: '/admin/coupons',
    icon: Ticket,
  },
  {
    id: 'home-slides',
    label: 'Home Slider',
    to: '/admin/home-slides',
    icon: LayoutTemplate,
  },
  {
    id: 'home-testimonials',
    label: 'Home Testimonials',
    to: '/admin/home-testimonials',
    icon: MessageSquareQuote,
  },
  {
    id: 'home-offer-marquee',
    label: 'Offer Marquee',
    to: '/admin/home-offer-marquee',
    icon: Megaphone,
  },
  {
    id: 'category-carousel',
    label: 'Shop Categories',
    to: '/admin/category-carousel',
    icon: CircleDot,
  },
  {
    id: 'product-reels',
    label: 'Product Reels',
    to: '/admin/product-reels',
    icon: Clapperboard,
  },
  {
    id: 'integrations',
    label: 'Integrations',
    to: '/admin/integrations',
    icon: Plug,
  },
  {
    id: 'media',
    label: 'Media',
    to: '/admin/media',
    icon: ImageIcon,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    to: '/admin/analytics',
    icon: BarChart3,
  },
  {
    id: 'reviews',
    label: 'Reviews',
    to: '/admin/reviews',
    icon: Star,
  },
  {
    id: 'users',
    label: 'Users',
    to: '/admin/users',
    icon: UserCog,
  },
  {
    id: 'roles',
    label: 'Roles & Permissions',
    to: '/admin/roles',
    icon: Shield,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    to: '/admin/notifications',
    icon: Bell,
  },
  {
    id: 'system',
    label: 'System Center',
    to: '/admin/system',
    icon: Activity,
    description: 'Audit logs, security, backup & monitoring',
  },
  {
    id: 'settings',
    label: 'Settings',
    to: '/admin/settings',
    icon: Settings,
  },
]

export const adminFooterNavigation = [
  {
    id: 'profile',
    label: 'Profile',
    to: '/admin/profile',
    icon: UserCircle,
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    action: 'logout',
  },
]

const flattenNav = (items) =>
  items.flatMap((item) => (item.children ? [item, ...item.children] : [item]))

const allNavItems = flattenNav([...adminNavigation, ...adminFooterNavigation.filter((i) => i.to)])

export function getAdminPageMeta(pathname) {
  const exact = allNavItems.find((item) => item.to === pathname)
  if (exact) return { title: exact.label, description: exact.description || '' }

  if (pathname.startsWith('/admin/products')) {
    return { title: 'Products', description: 'Manage catalog products' }
  }
  if (pathname.startsWith('/admin/t-shirt-printing')) {
    return { title: 'T-Shirt Print', description: 'Manage custom t-shirt printing products' }
  }
  if (pathname.startsWith('/admin/name-plates')) {
    return { title: 'Name Plates', description: 'Manage name plate products' }
  }
  if (pathname.startsWith('/admin/pen-print')) {
    return { title: 'Pen Print', description: 'Manage custom pen print products' }
  }
  if (pathname.startsWith('/admin/uv-dtf-stickers')) {
    return { title: 'UV DTF Stickers', description: 'Manage UV DTF sticker products' }
  }
  if (pathname.startsWith('/admin/product-label-stickers')) {
    return { title: 'Product Label Stickers', description: 'Manage product label sticker products' }
  }
  if (pathname.startsWith('/admin/corporate-gifts')) {
    return { title: 'Corporate Gifts', description: 'Manage corporate gift products' }
  }
  if (pathname.startsWith('/admin/baby-birth-frames')) {
    return { title: 'Baby Birth Frames', description: 'Manage baby birth frame products' }
  }
  if (pathname.startsWith('/admin/trophies')) {
    return { title: 'Trophies', description: 'Manage trophy and memento products' }
  }
  if (pathname.startsWith('/admin/god-photo-frames')) {
    return { title: 'God Photo Frames', description: 'Manage god frame products' }
  }
  if (pathname.startsWith('/admin/wall-watches')) {
    return { title: 'Wall Watches', description: 'Manage custom wall clock products' }
  }
  if (pathname.startsWith('/admin/reviews')) {
    return { title: 'Reviews', description: 'Manage customer product reviews' }
  }
  if (pathname.startsWith('/admin/home-slides')) {
    return { title: 'Home Slider', description: 'Manage homepage banner slides' }
  }
  if (pathname.startsWith('/admin/home-testimonials')) {
    return { title: 'Home Testimonials', description: 'Manage homepage customer testimonials section' }
  }
  if (pathname.startsWith('/admin/home-offer-marquee')) {
    return { title: 'Offer Marquee', description: 'Manage the yellow scrolling offer bar on homepage' }
  }
  if (pathname.startsWith('/admin/category-carousel')) {
    return { title: 'Shop Categories', description: 'Manage homepage category videos and posters' }
  }
  if (pathname.startsWith('/admin/product-reels')) {
    return { title: 'Product Reels', description: 'Manage homepage product reel videos' }
  }
  if (pathname.startsWith('/admin/integrations')) {
    return { title: 'Integrations', description: 'Razorpay, Shiprocket, email & contact settings' }
  }
  if (pathname.startsWith('/admin/categories')) {
    return { title: 'Categories', description: 'Manage product categories' }
  }
  if (pathname.startsWith('/admin/orders')) {
    return { title: 'Orders', description: 'Manage fulfillment and payments' }
  }

  if (pathname.startsWith('/admin/inventory')) {
    return { title: 'Inventory', description: 'Stock and warehouse management' }
  }
  if (pathname.startsWith('/admin/customers')) {
    return { title: 'Customers', description: 'Storefront customer CRM' }
  }
  if (pathname.startsWith('/admin/users')) {
    return { title: 'Users', description: 'Manage customers and administrators' }
  }
  if (pathname.startsWith('/admin/settings')) {
    return { title: 'Settings', description: 'Store configuration' }
  }
  if (pathname.startsWith('/admin/roles')) {
    return { title: 'Roles & Permissions', description: 'Access control matrix' }
  }
  if (pathname.startsWith('/admin/profile')) {
    return { title: 'Profile', description: 'Your admin account' }
  }
  if (pathname.startsWith('/admin/system')) {
    return { title: 'System Center', description: 'Audit, security, backup & monitoring' }
  }
  if (pathname.startsWith('/admin/notifications')) {
    return { title: 'Notifications', description: 'Communication center' }
  }
  if (pathname.startsWith('/admin/analytics')) {
    return { title: 'Analytics', description: 'Reports & business intelligence' }
  }

  return { title: 'Admin', description: 'Store control panel' }
}

export function isNavItemActive(item, pathname, end = false) {
  if (!item.to) return false
  if (end) return pathname === item.to
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

export function isNavGroupActive(item, pathname) {
  if (item.to && isNavItemActive(item, pathname)) return true
  return item.children?.some((child) => isNavItemActive(child, pathname)) ?? false
}
