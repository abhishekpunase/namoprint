import { Construction } from 'lucide-react'
import { PageHeader } from '../../components/admin/ui/PageHeader'
import { EmptyState } from '../../components/admin/ui/EmptyState'

export function AdminPlaceholderPage({ title, description }) {
  return (
    <div className="admin-page admin-v2-module-page">
      <PageHeader
        eyebrow="Coming soon"
        title={title}
        description={description || 'This module will be redesigned in the next phase while keeping all existing APIs intact.'}
      />
      <section className="admin-v2-panel">
        <EmptyState
          icon={Construction}
          title={`${title} module`}
          description="The new admin layout is ready. Detailed screens for this section will be connected in the next prompts."
        />
      </section>
    </div>
  )
}
