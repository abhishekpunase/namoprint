import { absoluteUrl, buildBreadcrumbJsonLd, buildProductJsonLd, resolveProductSeo } from '../../config/seo'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import { Seo } from './Seo'

/**
 * SEO for catalog / god / nameplate / t-shirt product detail pages.
 */
export function ProductPageSeo({
  product,
  pathPrefix,
  listLabel,
  listPath,
  price,
  type = 'product',
}) {
  if (!product) return null

  const slug = product.slug
  const pagePath = `${pathPrefix}/${slug}`
  const pageUrl = absoluteUrl(pagePath)
  const image = resolveMediaUrl(product.images?.[0] || product.heroImageUrl || product.previewImageUrl)
  const { title: seoTitle, description, keywords } = resolveProductSeo(product)

  const resolvedPrice =
    typeof price === 'number'
      ? price
      : typeof product.price === 'number'
        ? product.price
        : product.qualityOptions?.[0]?.price

  return (
    <Seo
      title={seoTitle}
      description={description.slice(0, 160)}
      keywords={keywords || undefined}
      image={image}
      url={pageUrl}
      type={type}
      jsonLd={buildProductJsonLd({
        name: seoTitle || product.title,
        description,
        image,
        url: pageUrl,
        price: resolvedPrice,
      })}
      breadcrumbJsonLd={buildBreadcrumbJsonLd([
        { name: 'Home', url: absoluteUrl('/') },
        { name: listLabel, url: absoluteUrl(listPath) },
        { name: product.title, url: pageUrl },
      ])}
    />
  )
}
