import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { OrderDetailView } from '../../components/admin/orders/OrderDetailView'

export function AdminOrderDetailPage() {
  const { id } = useParams()

  return (
    <div className="ord-page">
      <Link to="/admin/orders" className="ord-back-link">← Back to orders</Link>
      <OrderDetailView orderId={id} />
    </div>
  )
}
