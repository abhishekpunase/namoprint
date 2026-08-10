import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCategoryForm } from '../../hooks/useCategoryForm'
import { CategoryForm } from '../../components/admin/categories/CategoryForm'
import { Skeleton } from '../../components/admin/ui/Loader'

export function AdminCategoryCreatePage() {
  const formApi = useCategoryForm({})

  useEffect(() => {
    formApi.loadCategories()
  }, [])

  return (
    <div className="cat-page">
      <Link to="/admin/categories" className="cat-back-link">← Back to categories</Link>
      <CategoryForm mode="create" {...formApi} onSubmit={formApi.submit} />
    </div>
  )
}

export function AdminCategoryEditPage({ categoryId }) {
  const formApi = useCategoryForm({ categoryId })

  useEffect(() => {
    if (categoryId) formApi.loadCategory(categoryId)
  }, [categoryId])

  if (formApi.loading) {
    return (
      <div className="cat-page">
        <Skeleton className="cat-detail-skeleton" />
      </div>
    )
  }

  return (
    <div className="cat-page">
      <Link to={`/admin/categories/${categoryId}`} className="cat-back-link">← Back to category</Link>
      <CategoryForm mode="edit" categoryId={categoryId} {...formApi} onSubmit={formApi.submit} />
    </div>
  )
}
