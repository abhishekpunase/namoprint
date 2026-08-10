import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/admin-panel.css'
import './styles/dashboard.css'
import './styles/products.css'
import './styles/categories.css'
import './styles/orders.css'
import './styles/tshirt-assets.css'
import './styles/product-editor.css'
import './styles/settings.css'
import './styles/users.css'
import './styles/customers.css'
import './styles/inventory.css'
import './styles/coupons.css'
import './styles/media.css'
import './styles/analytics.css'
import './styles/notifications.css'
import './styles/system.css'
import './styles/enterprise.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
