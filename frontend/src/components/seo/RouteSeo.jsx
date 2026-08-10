import { useLocation } from 'react-router-dom'
import { absoluteUrl, buildHomeJsonLd, getStaticRouteSeo } from '../../config/seo'
import { Seo } from './Seo'

/** Applies SEO meta for static storefront routes. Dynamic product pages override with their own `<Seo />`. */
export function RouteSeo() {
  const { pathname } = useLocation()
  const config = getStaticRouteSeo(pathname)

  if (!config) return null

  const isHome = pathname === '/'

  return (
    <Seo
      title={config.title}
      description={config.description}
      keywords={config.keywords}
      url={absoluteUrl(pathname)}
      jsonLd={isHome ? buildHomeJsonLd() : undefined}
      noindex={config.noindex}
    />
  )
}
