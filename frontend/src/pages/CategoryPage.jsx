import { Navigate, useParams } from 'react-router-dom'
import { resolveCategoryNavigatePath } from '../config/categoryRoutes'

/** Legacy /category/:type URLs → catalog or dedicated module pages */
export default function CategoryPage() {
  const { categoryType } = useParams()
  return <Navigate to={resolveCategoryNavigatePath(categoryType)} replace />
}
