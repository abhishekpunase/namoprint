import { Link } from 'react-router-dom'
import { useProductEditor } from '../../hooks/useProductEditor'
import { ProductEditor } from '../../components/admin/products/editor/ProductEditor'
import { Skeleton } from '../../components/admin/ui/Loader'
import { isCatalogDemoProduct } from '../../utils/adminProductCatalog'

export function AdminProductCreatePage() {
  const editor = useProductEditor({})

  return (
    <div className="peditor-page">
      <Link to="/admin/products" className="prod-back-link">← Back to products</Link>
      <ProductEditor editor={editor} mode="create" />
    </div>
  )
}

export function AdminProductEditPage({ productId }) {
  const editor = useProductEditor({ productId })

  if (editor.loading) {
    return (
      <div className="peditor-page">
        <Skeleton className="prod-detail-skeleton" />
      </div>
    )
  }

  return (
    <div className="peditor-page">
      <Link to={`/admin/products/${productId}`} className="prod-back-link">← Back to product</Link>
      {isCatalogDemoProduct(productId) ? (
        <div className="prod-alert prod-alert--info">
          Editing a website demo product. Saving will publish it to the database.
        </div>
      ) : null}
      <ProductEditor editor={editor} mode="edit" productId={productId} />
    </div>
  )
}
