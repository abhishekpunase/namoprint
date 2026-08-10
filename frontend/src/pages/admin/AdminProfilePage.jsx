import { Link } from 'react-router-dom'
import { useProfileSettings } from '../../hooks/useUserList'
import { ProfileSettings } from '../../components/admin/settings/ThemeSettings'
import { Skeleton } from '../../components/admin/ui/Loader'
import { useAuth } from '../../hooks/useAuth'

export function AdminProfilePage() {
  const profile = useProfileSettings()
  const { updateLocalUser } = useAuth()

  const handleSave = async () => {
    await profile.saveProfile()
    if (profile.profile) updateLocalUser(profile.profile)
  }

  if (profile.loading) {
    return (
      <div className="set-page">
        <Skeleton className="set-skeleton" />
      </div>
    )
  }

  return (
    <div className="set-page">
      <header className="set-page-header">
        <div>
          <nav className="set-breadcrumb"><Link to="/admin">Admin</Link> / <span>Profile</span></nav>
          <h1>My Profile</h1>
          <p>Manage your admin account settings.</p>
        </div>
      </header>
      <div className="set-content set-content--single">
        <ProfileSettings
          form={profile.form}
          setForm={profile.setForm}
          onSave={handleSave}
          saving={profile.saving}
          message={profile.message}
          error={profile.error}
        />
      </div>
    </div>
  )
}
