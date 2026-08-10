import { Navigate, useParams } from 'react-router-dom'
import { ProductDesignerPage } from './ProductDesignerPage'
import { fallbackProducts } from '../data/fallbackCatalog'
import { isWallWatchProduct, WALL_WATCH_CATALOG_BASE } from '../utils/wallWatchCatalog'

/** Wall clock designer at /custom-wall-watches/:slug */
export default function WallWatchDesignerPage() {
  const { slug } = useParams()
  const fallback = fallbackProducts.find((p) => p.slug === slug)

  if (fallback && !isWallWatchProduct(fallback)) {
    return <Navigate to={`/products/${slug}`} replace />
  }

  return (
    <ProductDesignerPage
      catalogBase={WALL_WATCH_CATALOG_BASE}
      catalogLabel="Custom Wall Watches"
    />
  )
}
