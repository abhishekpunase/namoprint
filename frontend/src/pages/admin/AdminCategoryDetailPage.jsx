import { useParams } from 'react-router-dom'
import { CategoryDetailView } from '../../components/admin/categories/CategoryDetailView'
import { AdminCategoryEditPage } from './AdminCategoryFormPage'

export function AdminCategoryDetailPage() {
  return <CategoryDetailView />
}

export function AdminCategoryEditRoutePage() {
  const { id } = useParams()
  return <AdminCategoryEditPage categoryId={id} />
}
