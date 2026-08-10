import { Link } from 'react-router-dom'
import { Seo } from '../components/seo/Seo'

export function NotFoundPage() {
  return (
    <>
      <Seo title="Page Not Found" description="The page you are looking for does not exist." noindex />
    <section className="success-page">
      <div className="success-card">
        <p className="eyebrow">404</p>
        <h1>Page not found.</h1>
        <p>This route does not exist in the storefront.</p>
        <Link className="btn btn-primary" to="/">
          Back home
        </Link>
      </div>
    </section>
    </>
  )
}
