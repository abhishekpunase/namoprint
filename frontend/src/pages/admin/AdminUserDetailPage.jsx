import { Link, useParams } from 'react-router-dom'
import { useUserDetail } from '../../hooks/useUserList'
import { UserDetailView } from '../../components/admin/users/UserProfile'
import { Skeleton } from '../../components/admin/ui/Loader'

export function AdminUserDetailPage() {
  const { id } = useParams()
  const detail = useUserDetail(id)

  if (detail.loading) {
    return (
      <div className="usr-page">
        <Skeleton className="usr-skeleton" />
      </div>
    )
  }

  if (detail.error) {
    return (
      <div className="usr-page">
        <p className="usr-message usr-message--err">{detail.error}</p>
        <Link to="/admin/users" className="usr-back-link">← Back to users</Link>
      </div>
    )
  }

  return (
    <div className="usr-page">
      <UserDetailView
        user={detail.user}
        orders={detail.orders}
        meta={detail.meta}
        onToggleStatus={detail.toggleStatus}
        onUpdateMeta={detail.updateMeta}
        saving={detail.saving}
        message={detail.message}
      />
    </div>
  )
}
