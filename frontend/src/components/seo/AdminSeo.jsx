import { Seo } from './Seo'

/** Admin panel pages should not be indexed by search engines. */
export function AdminSeo() {
  return (
    <Seo
      title="Admin Panel"
      description="Namo Print store administration."
      noindex
    />
  )
}
