import { getApiBaseUrl, getNetworkErrorMessage } from '../config/apiConfig'
import { fetchAllPaginated } from '../utils/fetchAllProducts'

export async function checkApiHealth() {
  try {
    const base = getApiBaseUrl()
    const healthUrl = base.startsWith('http')
      ? `${base.replace(/\/api\/?$/, '')}/health`
      : '/health'
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const response = await fetch(healthUrl, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!response.ok) return false
    const data = await response.json().catch(() => ({}))
    return data.ok === true && data.db === 'connected'
  } catch {
    return false
  }
}

const API_BASE_URL = getApiBaseUrl()

let refreshPromise = null

const isTokenExpiredMessage = (message = '') => {
  const value = String(message).toLowerCase()
  return value.includes('jwt expired') || value.includes('token expired') || value.includes('invalid token')
}

const clearSession = () => {
  localStorage.removeItem('omgs_access_token')
  localStorage.removeItem('omgs_refresh_token')
  localStorage.removeItem('omgs_user')
}

const redirectToLoginIfAdmin = () => {
  const path = window.location.pathname
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    window.location.assign(`/admin/login?expired=1&from=${encodeURIComponent(path)}`)
  }
}

const readErrorMessage = async (response) => {
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    return getNetworkErrorMessage()
  }
  try {
    const data = await response.json()
    if (response.status === 401 && data.message === 'Invalid email or password') {
      return 'Invalid email or password. Please check your details or create a new account.'
    }
    if (response.status === 401 && data.message === 'Invalid admin email or password') {
      return 'Invalid admin email or password. Please check your credentials.'
    }
    if (data.message === 'Cart is empty') {
      return 'Your cart could not be loaded. Please return to Cart and try checkout again.'
    }
    return data.message || data.error || 'Something went wrong'
  } catch {
    return response.status === 429
      ? 'Too many attempts. Please wait a minute and try again.'
      : 'Something went wrong'
  }
}

const formatClientError = (message) => {
  if (isTokenExpiredMessage(message)) {
    return 'Session expired. Please login again.'
  }
  return message
}

const shouldAttemptRefresh = (status, message, path, retry) =>
  retry && !path.startsWith('/auth/') && (status === 401 || isTokenExpiredMessage(message))

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('omgs_refresh_token')
  if (!refreshToken) throw new Error('Session expired')

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) throw new Error('Session expired')

  const data = await response.json()
  localStorage.setItem('omgs_access_token', data.accessToken)
  localStorage.setItem('omgs_refresh_token', data.refreshToken)
  localStorage.setItem('omgs_user', JSON.stringify(data.user))
  return data.accessToken
}

export async function apiRequest(path, options = {}, retry = true) {
  const token = localStorage.getItem('omgs_access_token')
  const headers = new Headers(options.headers || {})

  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body:
        options.body && !(options.body instanceof FormData) && typeof options.body !== 'string'
          ? JSON.stringify(options.body)
          : options.body,
    })
  } catch {
    throw new Error(getNetworkErrorMessage())
  }

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response)

    if (shouldAttemptRefresh(response.status, errorMessage, path, retry)) {
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }
        await refreshPromise
        return apiRequest(path, options, false)
      } catch {
        clearSession()
        redirectToLoginIfAdmin()
        throw new Error('Session expired. Please login again.')
      }
    }

    throw new Error(formatClientError(errorMessage))
  }

  return response.json()
}

export const api = {
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload }),
  adminLogin: (payload) => apiRequest('/auth/admin/login', { method: 'POST', body: payload }),
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: payload }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  me: () => apiRequest('/auth/me'),
  forgotPassword: (payload) => apiRequest('/auth/forgot-password', { method: 'POST', body: payload }),
  resetPassword: (payload) => apiRequest('/auth/reset-password', { method: 'POST', body: payload }),
  profile: () => apiRequest('/account/profile'),
  updateProfile: (payload) => apiRequest('/account/profile', { method: 'PATCH', body: payload }),
  addAddress: (payload) => apiRequest('/account/addresses', { method: 'POST', body: payload }),
  deleteAddress: (addressId) => apiRequest(`/account/addresses/${addressId}`, { method: 'DELETE' }),
  accountOrders: () => apiRequest('/account/orders'),
  accountPayments: () => apiRequest('/account/payments'),
  categories: () => apiRequest('/categories'),
  products: (query = '') => fetchAllPaginated((q) => apiRequest(`/products${q}`), query),
  product: (slug) => apiRequest(`/products/${slug}`),
  uploadPhoto: (file) => {
    const formData = new FormData()
    formData.append('photo', file)
    return apiRequest('/uploads/photo', { method: 'POST', body: formData })
  },
  uploadVideo: (file) => {
    const formData = new FormData()
    formData.append('video', file)
    return apiRequest('/uploads/video', { method: 'POST', body: formData })
  },
  uploadDesign: (file) => {
    const formData = new FormData()
    formData.append('design', file)
    return apiRequest('/uploads/design', { method: 'POST', body: formData })
  },
  preview: (payload) => apiRequest('/uploads/preview', { method: 'POST', body: payload }),
  cart: () => apiRequest('/cart'),
  syncCart: (payload) => apiRequest('/cart/sync', { method: 'POST', body: payload }),
  addCartItem: (payload) => apiRequest('/cart/items', { method: 'POST', body: payload }),
  updateCartItem: (itemId, payload) => apiRequest(`/cart/items/${itemId}`, { method: 'PATCH', body: payload }),
  removeCartItem: (itemId) => apiRequest(`/cart/items/${itemId}`, { method: 'DELETE' }),
  checkout: (payload) => apiRequest('/orders/checkout', { method: 'POST', body: payload }),
  validateCoupon: (payload) => apiRequest('/coupons/validate', { method: 'POST', body: payload }),
  coupons: () => apiRequest('/coupons'),
  orders: () => apiRequest('/orders/my'),
  createPayment: (payload) => apiRequest('/payments/razorpay/order', { method: 'POST', body: payload }),
  verifyPayment: (payload) => apiRequest('/payments/razorpay/verify', { method: 'POST', body: payload }),
  adminDashboard: () => apiRequest('/admin/dashboard'),
  adminProducts: (query = '') => apiRequest(`/admin/products${query}`),
  adminCreateProduct: (payload) => apiRequest('/admin/products', { method: 'POST', body: payload }),
  adminUpdateProduct: (id, payload) => apiRequest(`/admin/products/${id}`, { method: 'PATCH', body: payload }),
  adminDeleteProduct: (id) => apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),
  adminCategories: () => apiRequest('/admin/categories'),
  adminCreateCategory: (payload) => apiRequest('/admin/categories', { method: 'POST', body: payload }),
  adminUpdateCategory: (id, payload) => apiRequest(`/admin/categories/${id}`, { method: 'PATCH', body: payload }),
  adminDeleteCategory: (id) => apiRequest(`/admin/categories/${id}`, { method: 'DELETE' }),
  adminOrders: () => apiRequest('/admin/orders'),
  adminOrder: (id) => apiRequest(`/admin/orders/${id}`),
  adminUpdateOrderStatus: (id, payload) => apiRequest(`/admin/orders/${id}/status`, { method: 'PATCH', body: payload }),
  adminDownloadOrderDesign: async (orderId, itemId, orderNo = 'order', sku = 'design') => {
    const token = localStorage.getItem('omgs_access_token')
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/items/${itemId}/design`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) {
      const message = await readErrorMessage(response)
      throw new Error(formatClientError(message))
    }
    const blob = await response.blob()
    const safeName = `${orderNo}-${sku || 'design'}.jpg`.replace(/[^\w.-]+/g, '-')
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = safeName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },
  homeSlides: () => apiRequest('/home-slides'),
  adminHomeSlides: () => apiRequest('/admin/home-slides'),
  adminCreateHomeSlide: (payload) => apiRequest('/admin/home-slides', { method: 'POST', body: payload }),
  adminUpdateHomeSlide: (id, payload) =>
    apiRequest(`/admin/home-slides/${id}`, { method: 'PATCH', body: payload }),
  adminDeleteHomeSlide: (id) => apiRequest(`/admin/home-slides/${id}`, { method: 'DELETE' }),
  categoryCarousel: () => apiRequest('/category-carousel'),
  adminCategoryCarousel: () => apiRequest('/admin/category-carousel'),
  adminCreateCategoryCarouselItem: (payload) =>
    apiRequest('/admin/category-carousel', { method: 'POST', body: payload }),
  adminUpdateCategoryCarouselItem: (id, payload) =>
    apiRequest(`/admin/category-carousel/${id}`, { method: 'PATCH', body: payload }),
  adminDeleteCategoryCarouselItem: (id) =>
    apiRequest(`/admin/category-carousel/${id}`, { method: 'DELETE' }),
  homeTestimonials: () => apiRequest('/home-testimonials'),
  adminHomeTestimonials: () => apiRequest('/admin/home-testimonials'),
  adminUpdateHomeTestimonialSection: (payload) =>
    apiRequest('/admin/home-testimonials/section', { method: 'PATCH', body: payload }),
  adminCreateHomeTestimonial: (payload) =>
    apiRequest('/admin/home-testimonials', { method: 'POST', body: payload }),
  adminUpdateHomeTestimonial: (id, payload) =>
    apiRequest(`/admin/home-testimonials/${id}`, { method: 'PATCH', body: payload }),
  adminDeleteHomeTestimonial: (id) =>
    apiRequest(`/admin/home-testimonials/${id}`, { method: 'DELETE' }),
  homeOfferMarquee: () => apiRequest('/home-offer-marquee'),
  adminHomeOfferMarquee: () => apiRequest('/admin/home-offer-marquee'),
  adminCreateHomeOfferMarqueeItem: (payload) =>
    apiRequest('/admin/home-offer-marquee', { method: 'POST', body: payload }),
  adminUpdateHomeOfferMarqueeItem: (id, payload) =>
    apiRequest(`/admin/home-offer-marquee/${id}`, { method: 'PATCH', body: payload }),
  adminDeleteHomeOfferMarqueeItem: (id) =>
    apiRequest(`/admin/home-offer-marquee/${id}`, { method: 'DELETE' }),
  productReels: () => apiRequest('/product-reels'),
  adminProductReels: () => apiRequest('/admin/product-reels'),
  adminCreateProductReel: (payload) => apiRequest('/admin/product-reels', { method: 'POST', body: payload }),
  adminUpdateProductReel: (id, payload) =>
    apiRequest(`/admin/product-reels/${id}`, { method: 'PATCH', body: payload }),
  adminDeleteProductReel: (id) => apiRequest(`/admin/product-reels/${id}`, { method: 'DELETE' }),
  contactSettings: () => apiRequest('/contact/settings'),
  submitContact: (payload) => apiRequest('/contact', { method: 'POST', body: payload }),
  adminIntegrations: () => apiRequest('/admin/integrations'),
  adminUpdateIntegrations: (payload) => apiRequest('/admin/integrations', { method: 'PATCH', body: payload }),
  adminSendTestEmail: (to) =>
    apiRequest('/admin/integrations/test-email', { method: 'POST', body: { to } }),
  adminTestShiprocket: () => apiRequest('/admin/integrations/test-shiprocket', { method: 'POST', body: {} }),
  reviews: (query = '') => apiRequest(`/reviews${query}`),
  adminReviews: () => apiRequest('/admin/reviews'),
  adminCreateReview: (payload) => apiRequest('/admin/reviews', { method: 'POST', body: payload }),
  adminUpdateReview: (id, payload) => apiRequest(`/admin/reviews/${id}`, { method: 'PATCH', body: payload }),
  adminDeleteReview: (id) => apiRequest(`/admin/reviews/${id}`, { method: 'DELETE' }),
  adminUsers: (query = '') => apiRequest(`/admin/users${query}`),
  adminUser: (id) => apiRequest(`/admin/users/${id}`),
  adminUpdateUserStatus: (id, payload) => apiRequest(`/admin/users/${id}/status`, { method: 'PATCH', body: payload }),
}
