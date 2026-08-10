import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout'
import { AdminProtectedRoute } from './components/layout/AdminProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { CartSync } from './components/layout/CartSync'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { DesignProvider } from './context/DesignContext'
import { AccountPage } from './pages/AccountPage'
import { CartPage } from './pages/CartPage'
import { WishlistPage } from './pages/WishlistPage'
import { CatalogPage } from './pages/CatalogPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OrdersPage } from './pages/OrdersPage'
import { PaymentSuccessPage } from './pages/PaymentSuccessPage'
import { ProductDesignerPage } from './pages/ProductDesignerPage'
import { RegisterPage } from './pages/RegisterPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminCategoryCreatePage } from './pages/admin/AdminCategoryFormPage'
import { AdminCategoryDetailPage, AdminCategoryEditRoutePage } from './pages/admin/AdminCategoryDetailPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminProductCreatePage } from './pages/admin/AdminProductFormPage'
import { AdminProductDetailPage, AdminProductEditRoutePage } from './pages/admin/AdminProductDetailPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage'
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage'
import { AdminCustomerDetailPage } from './pages/admin/AdminCustomerDetailPage'
import { AdminSettingsPage, AdminSettingsIndexPage } from './pages/admin/AdminSettingsPage'
import { AdminRolesPage } from './pages/admin/AdminRolesPage'
import { AdminProfilePage } from './pages/admin/AdminProfilePage'
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage'
import { AdminInventoryDetailPage } from './pages/admin/AdminInventoryDetailPage'
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage'
import { AdminCouponDetailPage } from './pages/admin/AdminCouponDetailPage'
import { AdminCouponCreatePage, AdminCouponEditPage } from './pages/admin/AdminCouponCreatePage'
import { AdminMediaPage } from './pages/admin/AdminMediaPage'
import { AdminGodProductsPage } from './pages/admin/AdminGodProductsPage'
import { AdminNamePlateProductsPage } from './pages/admin/AdminNamePlateProductsPage'
import { AdminCorporateGiftProductsPage } from './pages/admin/AdminCorporateGiftProductsPage'
import { AdminBabyBirthFrameProductsPage } from './pages/admin/AdminBabyBirthFrameProductsPage'
import { AdminTrophyProductsPage } from './pages/admin/AdminTrophyProductsPage'
import { AdminPenPrintProductsPage } from './pages/admin/AdminPenPrintProductsPage'
import { AdminUvDtfStickerProductsPage } from './pages/admin/AdminUvDtfStickerProductsPage'
import { AdminProductLabelStickerProductsPage } from './pages/admin/AdminProductLabelStickerProductsPage'
import { AdminTShirtProductsPage } from './pages/admin/AdminTShirtProductsPage'
import { AdminWallWatchProductsPage } from './pages/admin/AdminWallWatchProductsPage'
import { AdminHomeSlidesPage } from './pages/admin/AdminHomeSlidesPage'
import { AdminHomeTestimonialsPage } from './pages/admin/AdminHomeTestimonialsPage'
import { AdminHomeOfferMarqueePage } from './pages/admin/AdminHomeOfferMarqueePage'
import { AdminCategoryCarouselPage } from './pages/admin/AdminCategoryCarouselPage'
import { AdminProductReelsPage } from './pages/admin/AdminProductReelsPage'
import { AdminIntegrationsPage } from './pages/admin/AdminIntegrationsPage'
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage'

const AdminAnalyticsPage = lazy(() =>
  import('./pages/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage })),
)
const AdminNotificationsPage = lazy(() =>
  import('./pages/admin/AdminNotificationsPage').then((m) => ({ default: m.AdminNotificationsPage })),
)
const AdminSystemPage = lazy(() =>
  import('./pages/admin/AdminSystemPage').then((m) => ({ default: m.AdminSystemPage })),
)

function AdminRouteFallback() {
  return (
    <div className="admin-v2-content__inner" style={{ padding: 24 }}>
      <div className="sys-skeleton" style={{ minHeight: 120, borderRadius: 12 }} />
    </div>
  )
}

function LazyAdmin({ children }) {
  return <Suspense fallback={<AdminRouteFallback />}>{children}</Suspense>
}
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { BulkOrdersPage } from './pages/Bulk-ordersPage'
import FloatingWhatsApp from './components/layout/FloatingWhatsApp'
import { PrivacyPolicyPage } from './pages/Privacy-policyPage'
import { TermsAndConditionsPage } from './pages/TermsAndConditionsPage'
import { RefundPolicyPage } from './pages/RefundPolicyPage'
import { ShippingPolicyPage } from './pages/ShippingPolicyPage'
import { FaqPage } from './pages/FaqPage'
import  CategoryPage  from './pages/CategoryPage'
// NEW: God Photo Frame + Name Plate modules (standalone, do not touch anything above)
import GodPhotosPage from './pages/GodPhotosPage'
import GodProductDetailPage from './pages/GodProductDetailPage'
import NamePlatePage from './pages/NamePlatePage'
import NamePlateProductDetailPage from './pages/NamePlateProductDetailPage'
import CorporateGiftPage from './pages/CorporateGiftPage'
import CorporateGiftProductDetailPage from './pages/CorporateGiftProductDetailPage'
import BabyBirthFramePage from './pages/BabyBirthFramePage'
import BabyBirthFrameProductDetailPage from './pages/BabyBirthFrameProductDetailPage'
import TrophyPage from './pages/TrophyPage'
import TrophyProductDetailPage from './pages/TrophyProductDetailPage'
import PenPrintPage from './pages/PenPrintPage'
import PenPrintProductDetailPage from './pages/PenPrintProductDetailPage'
import UvDtfStickerPage from './pages/UvDtfStickerPage'
import UvDtfStickerProductDetailPage from './pages/UvDtfStickerProductDetailPage'
import ProductLabelStickerPage from './pages/ProductLabelStickerPage'
import ProductLabelStickerProductDetailPage from './pages/ProductLabelStickerProductDetailPage'
import TShirtPage from './pages/TShirtPage'
import TShirtProductDetailPage from './pages/TShirtProductDetailPage'
import WallWatchPage from './pages/WallWatchPage'
import WallWatchDesignerPage from './pages/WallWatchDesignerPage'



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <DesignProvider>
            <CartSync />
            <Routes>
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/new" element={<AdminProductCreatePage />} />
                <Route path="products/:id" element={<AdminProductDetailPage />} />
                <Route path="products/:id/edit" element={<AdminProductEditRoutePage />} />
                <Route path="god-photo-frames" element={<AdminGodProductsPage />} />
                <Route path="name-plates" element={<AdminNamePlateProductsPage />} />
                <Route path="corporate-gifts" element={<AdminCorporateGiftProductsPage />} />
                <Route path="baby-birth-frames" element={<AdminBabyBirthFrameProductsPage />} />
                <Route path="trophies" element={<AdminTrophyProductsPage />} />
                <Route path="pen-print" element={<AdminPenPrintProductsPage />} />
                <Route path="uv-dtf-stickers" element={<AdminUvDtfStickerProductsPage />} />
                <Route path="product-label-stickers" element={<AdminProductLabelStickerProductsPage />} />
                <Route path="t-shirt-printing" element={<AdminTShirtProductsPage />} />
                <Route path="wall-watches" element={<AdminWallWatchProductsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="categories/new" element={<AdminCategoryCreatePage />} />
                <Route path="categories/:id" element={<AdminCategoryDetailPage />} />
                <Route path="categories/:id/edit" element={<AdminCategoryEditRoutePage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="users/:id" element={<AdminUserDetailPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="customers/:id" element={<AdminCustomerDetailPage />} />
                <Route path="inventory" element={<AdminInventoryPage />} />
                <Route path="inventory/product/:productId" element={<AdminInventoryDetailPage />} />
                <Route path="coupons" element={<AdminCouponsPage />} />
                <Route path="coupons/new" element={<AdminCouponCreatePage />} />
                <Route path="coupons/:code" element={<AdminCouponDetailPage />} />
                <Route path="coupons/:code/edit" element={<AdminCouponEditPage />} />
                <Route path="media" element={<AdminMediaPage />} />
                <Route path="home-slides" element={<AdminHomeSlidesPage />} />
                <Route path="home-testimonials" element={<AdminHomeTestimonialsPage />} />
                <Route path="home-offer-marquee" element={<AdminHomeOfferMarqueePage />} />
                <Route path="category-carousel" element={<AdminCategoryCarouselPage />} />
                <Route path="product-reels" element={<AdminProductReelsPage />} />
                <Route path="integrations" element={<AdminIntegrationsPage />} />
                <Route path="analytics" element={<LazyAdmin><AdminAnalyticsPage /></LazyAdmin>} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route
                  path="roles"
                  element={<AdminRolesPage />}
                />
                <Route
                  path="notifications"
                  element={<LazyAdmin><AdminNotificationsPage /></LazyAdmin>}
                />
                <Route
                  path="system"
                  element={<LazyAdmin><AdminSystemPage /></LazyAdmin>}
                />
                <Route path="settings" element={<AdminSettingsIndexPage />} />
                <Route path="settings/:section" element={<AdminSettingsPage />} />
                <Route
                  path="profile"
                  element={<AdminProfilePage />}
                />
              </Route>

              <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="products" element={<CatalogPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="products/:slug" element={<ProductDesignerPage />} />
                <Route path="category/:categoryType" element={<CategoryPage />} />
                {/* NEW: God Photo Frame + Name Plate routes (standalone) */}
                <Route path="god-photo-frames" element={<GodPhotosPage />} />
                <Route path="god-photo-frames/:slug" element={<GodProductDetailPage />} />
                <Route path="name-plates" element={<NamePlatePage />} />
                <Route path="name-plates/:slug" element={<NamePlateProductDetailPage />} />
                <Route path="corporate-gifts" element={<CorporateGiftPage />} />
                <Route path="corporate-gifts/:slug" element={<CorporateGiftProductDetailPage />} />
                <Route path="baby-birth-frames" element={<BabyBirthFramePage />} />
                <Route path="baby-birth-frames/:slug" element={<BabyBirthFrameProductDetailPage />} />
                <Route path="trophies" element={<TrophyPage />} />
                <Route path="trophies/:slug" element={<TrophyProductDetailPage />} />
                <Route path="pen-print" element={<PenPrintPage />} />
                <Route path="pen-print/:slug" element={<PenPrintProductDetailPage />} />
                <Route path="uv-dtf-stickers" element={<UvDtfStickerPage />} />
                <Route path="uv-dtf-stickers/:slug" element={<UvDtfStickerProductDetailPage />} />
                <Route path="product-label-stickers" element={<ProductLabelStickerPage />} />
                <Route path="product-label-stickers/:slug" element={<ProductLabelStickerProductDetailPage />} />
                <Route path="t-shirt-printing" element={<TShirtPage />} />
                <Route path="t-shirt-printing/:slug" element={<TShirtProductDetailPage />} />
                <Route path="custom-wall-watches" element={<WallWatchPage />} />
                <Route path="custom-wall-watches/:slug" element={<WallWatchDesignerPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="bulk-orders" element={<BulkOrdersPage />} />
                <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="terms-and-conditions" element={<TermsAndConditionsPage />} />
                <Route path="refund-policy" element={<RefundPolicyPage />} />
                <Route path="shipping-policy" element={<ShippingPolicyPage />} />
                <Route path="faq" element={<FaqPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="payment-success"
                  element={
                    <ProtectedRoute>
                      <PaymentSuccessPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="account"
                  element={
                    <ProtectedRoute>
                      <AccountPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="account/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
             <FloatingWhatsApp />
          </DesignProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
