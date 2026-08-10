import { useEffect } from 'react'
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  TWITTER_HANDLE,
  absoluteUrl,
  buildPageTitle,
} from '../../config/seo'

function upsertMeta(attr, key, content) {
  if (content == null || content === '') return
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(id, data) {
  const existing = document.getElementById(id)
  if (!data) {
    existing?.remove()
    return
  }
  let el = existing
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/**
 * Updates document title, meta tags, Open Graph, Twitter Card, canonical URL, and JSON-LD.
 */
export function Seo({
  title,
  description = SITE_DESCRIPTION,
  keywords,
  image,
  url,
  type = 'website',
  jsonLd,
  breadcrumbJsonLd,
  noindex = false,
}) {
  useEffect(() => {
    const pageTitle = buildPageTitle(title)
    const canonical = url || (typeof window !== 'undefined' ? window.location.href.split('?')[0] : '')
    const ogImage = image ? (image.startsWith('http') ? image : absoluteUrl(image)) : absoluteUrl(DEFAULT_OG_IMAGE)
    const robots = noindex ? 'noindex, nofollow' : 'index, follow'

    document.title = pageTitle
    document.documentElement.lang = 'en'

    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', robots)
    upsertMeta('name', 'author', SITE_NAME)
    if (keywords) upsertMeta('name', 'keywords', keywords)

    upsertMeta('property', 'og:title', pageTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:locale', SITE_LOCALE)
    upsertMeta('property', 'og:image', ogImage)
    if (canonical) upsertMeta('property', 'og:url', canonical)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', pageTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', ogImage)
    if (TWITTER_HANDLE) upsertMeta('name', 'twitter:site', TWITTER_HANDLE)

    upsertLink('canonical', canonical)

    setJsonLd('seo-jsonld-primary', jsonLd)
    setJsonLd('seo-jsonld-breadcrumb', breadcrumbJsonLd)
  }, [title, description, keywords, image, url, type, jsonLd, breadcrumbJsonLd, noindex])

  return null
}
