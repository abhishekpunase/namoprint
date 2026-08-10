import { useParams } from 'react-router-dom'
import { ProductDetailView } from '../../components/admin/products/ProductDetailView'
import { AdminProductEditPage } from './AdminProductFormPage'

export function AdminProductDetailPage() {
  return <ProductDetailView />
}

export function AdminProductEditRoutePage() {
  const { id } = useParams()
  return <AdminProductEditPage productId={id} />
}
