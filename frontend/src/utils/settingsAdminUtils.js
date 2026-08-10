export const SETTINGS_STORAGE_KEY = 'omgs_admin_settings'
export const ROLES_STORAGE_KEY = 'omgs_admin_roles'
export const ACTIVITY_LOGS_KEY = 'omgs_admin_activity_logs'
export const USER_META_KEY = 'omgs_admin_user_meta'

export const SETTINGS_SECTIONS = [
  { id: 'general', label: 'General', group: 'Store' },
  { id: 'company', label: 'Company', group: 'Store' },
  { id: 'users', label: 'Users', group: 'Team', external: '/admin/users' },
  { id: 'roles', label: 'Roles', group: 'Team', external: '/admin/roles' },
  { id: 'permissions', label: 'Permissions', group: 'Team', external: '/admin/roles' },
  { id: 'security', label: 'Security', group: 'Access' },
  { id: 'authentication', label: 'Authentication', group: 'Access' },
  { id: 'notifications', label: 'Notifications', group: 'Communications', external: '/admin/notifications' },
  { id: 'email', label: 'Email', group: 'Communications' },
  { id: 'payments', label: 'Payments', group: 'Commerce' },
  { id: 'shipping', label: 'Shipping', group: 'Commerce' },
  { id: 'taxes', label: 'Taxes', group: 'Commerce' },
  { id: 'localization', label: 'Localization', group: 'Regional' },
  { id: 'languages', label: 'Languages', group: 'Regional', section: 'localization' },
  { id: 'currencies', label: 'Currencies', group: 'Regional', section: 'localization' },
  { id: 'media', label: 'Media & Storage', group: 'Content' },
  { id: 'seo', label: 'SEO', group: 'Content' },
  { id: 'integrations', label: 'Integrations', group: 'Developer' },
  { id: 'api-keys', label: 'API Keys', group: 'Developer' },
  { id: 'backups', label: 'Backups', group: 'Developer' },
  { id: 'logs', label: 'Activity Logs', group: 'Developer' },
  { id: 'appearance', label: 'Appearance', group: 'Personalization' },
  { id: 'theme', label: 'Theme', group: 'Personalization', section: 'appearance' },
  { id: 'profile', label: 'Profile', group: 'Personalization', external: '/admin/profile' },
]

export const PERMISSION_MODULES = [
  'Dashboard',
  'Products',
  'Orders',
  'Categories',
  'Customers',
  'Inventory',
  'Coupons',
  'Media',
  'Reports',
  'Users',
  'Settings',
  'Analytics',
  'Shipping',
  'Payments',
]

export const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'import', 'approve', 'manage']

export const DEFAULT_ROLES = [
  {
    id: 'administrator',
    name: 'Administrator',
    description: 'Full access (maps to backend admin role)',
    backendRole: 'admin',
    system: true,
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Operations and catalog management',
    backendRole: 'admin',
    system: true,
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Order fulfillment and support',
    backendRole: 'customer',
    system: true,
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Content and product editing',
    backendRole: 'customer',
    system: true,
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Customer and order support',
    backendRole: 'customer',
    system: true,
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    description: 'Inventory and shipping',
    backendRole: 'customer',
    system: true,
  },
]

export const DEFAULT_SETTINGS = {
  general: {
    companyName: 'NamoPrint',
    websiteName: 'NamoPrint Store',
    websiteUrl: 'https://namoprint.com',
    adminEmail: 'admin@omgs.com',
    supportEmail: 'support@namoprint.com',
    phone: '',
    address: '',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    logo: '',
    favicon: '',
  },
  company: {
    logo: '',
    darkLogo: '',
    lightLogo: '',
    invoiceLogo: '',
    gstNumber: '',
    taxId: '',
    businessAddress: '',
    supportNumber: '',
    socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '' },
  },
  security: {
    minPasswordLength: 8,
    passwordExpiryDays: 90,
    require2fa: false,
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    ipWhitelist: '',
    deviceManagement: true,
  },
  authentication: {
    jwtEnabled: true,
    oauthEnabled: false,
    googleLogin: false,
    facebookLogin: false,
    githubLogin: false,
    otpLogin: false,
    rememberMe: true,
  },
  email: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    encryption: 'tls',
    senderEmail: '',
    senderName: 'NamoPrint',
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: false,
    desktopNotifications: true,
    orderAlerts: true,
    inventoryAlerts: true,
    lowStockAlerts: true,
    paymentAlerts: true,
  },
  payments: {
    razorpay: true,
    stripe: false,
    paypal: false,
    cod: true,
    upi: true,
    bankTransfer: false,
  },
  shipping: {
    defaultCarrier: 'Shiprocket',
    flatRate: 0,
    freeShippingThreshold: 999,
    trackingEnabled: true,
    deliveryEstimateDays: 5,
  },
  taxes: {
    enabled: true,
    inclusive: false,
    defaultRate: 18,
    gstEnabled: true,
  },
  localization: {
    timezone: 'Asia/Kolkata',
    country: 'IN',
    language: 'en',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-IN',
  },
  media: {
    maxUploadMb: 25,
    allowedFormats: ['png', 'jpg', 'jpeg', 'webp', 'svg'],
    compression: true,
    imageQuality: 85,
    storageLocation: 'local',
  },
  seo: {
    metaTitle: 'NamoPrint — Custom Prints & Gifts',
    metaDescription: 'Premium personalized printing products.',
    googleAnalytics: '',
    metaPixel: '',
    googleTagManager: '',
    robotsTxt: 'User-agent: *\nAllow: /',
    sitemapEnabled: true,
  },
  integrations: {
    whatsapp: true,
    razorpay: true,
    shiprocket: true,
    awsS3: false,
  },
  appearance: {
    primaryColor: '#6366f1',
    accentColor: '#8b5cf6',
    sidebarStyle: 'default',
    layoutWidth: 'fluid',
    roundedCorners: true,
    typography: 'Inter',
  },
}

export function deepMergeSettings(base, patch) {
  const out = { ...base }
  Object.keys(patch || {}).forEach((key) => {
    if (patch[key] && typeof patch[key] === 'object' && !Array.isArray(patch[key])) {
      out[key] = deepMergeSettings(base[key] || {}, patch[key])
    } else {
      out[key] = patch[key]
    }
  })
  return out
}

export function readJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeJsonStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function appendActivityLog(entry) {
  const logs = readJsonStorage(ACTIVITY_LOGS_KEY, [])
  logs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  })
  writeJsonStorage(ACTIVITY_LOGS_KEY, logs.slice(0, 500))
}

export function buildDefaultPermissions(roleId) {
  const matrix = {}
  PERMISSION_MODULES.forEach((mod) => {
    matrix[mod] = {}
    PERMISSION_ACTIONS.forEach((action) => {
      matrix[mod][action] = roleId === 'administrator'
    })
  })
  if (roleId === 'manager') {
    ;['Products', 'Orders', 'Categories', 'Customers', 'Shipping'].forEach((mod) => {
      ;['view', 'create', 'edit', 'export', 'manage'].forEach((a) => {
        matrix[mod][a] = true
      })
    })
  }
  return matrix
}

export function filterSettingsSections(query) {
  const q = query.trim().toLowerCase()
  if (!q) return SETTINGS_SECTIONS
  return SETTINGS_SECTIONS.filter(
    (s) => s.label.toLowerCase().includes(q) || s.group.toLowerCase().includes(q) || s.id.includes(q),
  )
}

export function getSectionMeta(sectionId) {
  return SETTINGS_SECTIONS.find((s) => s.id === sectionId || s.section === sectionId)
}
