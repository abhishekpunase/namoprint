import { SITE_NAME, getSiteOrigin } from '../../../config/seo'
import { previewSlugFromTitle } from '../../../utils/productSeoAdmin'

/**
 * Admin SEO fields + Google search result preview.
 * Used in Product Editor and standalone product admin pages (God, Name Plate, T-Shirt).
 */
export function ProductSeoFields({
  form,
  setForm,
  urlPrefix = '/products/',
  slug,
  titleField = 'title',
  descriptionField = 'description',
}) {
  const productTitle = form[titleField] || ''
  const productDescription = form[descriptionField] || ''
  const previewSlug = slug || form.slug || previewSlugFromTitle(productTitle)
  const previewUrl = `${getSiteOrigin()}${urlPrefix}${previewSlug}`
  const previewTitle = form.seoTitle?.trim() || productTitle || 'Product title'
  const previewDescription =
    form.seoDescription?.trim() ||
    productDescription ||
    'Add a meta description so customers find this product on Google.'

  const titleLen = (form.seoTitle || '').length
  const descLen = (form.seoDescription || '').length

  return (
    <div className="prod-form-grid prod-seo-fields">
      <p className="prod-span-2 prod-seo-fields__intro">
        Search engines use these fields. Leave blank to use the product title and description automatically.
      </p>

      <label className="prod-span-2">
        Meta title
        <input
          value={form.seoTitle || ''}
          onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
          placeholder={productTitle || 'Custom SEO title'}
          maxLength={70}
        />
        <span className={`prod-seo-hint ${titleLen > 60 ? 'is-warn' : ''}`}>
          {titleLen}/60 recommended · {form.seoTitle?.length || 0}/70 max
        </span>
      </label>

      <label className="prod-span-2">
        Meta description
        <textarea
          value={form.seoDescription || ''}
          onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
          rows={4}
          placeholder={productDescription || 'Short description for Google search results…'}
          maxLength={320}
        />
        <span className={`prod-seo-hint ${descLen > 160 ? 'is-warn' : ''}`}>
          {descLen}/160 recommended · {form.seoDescription?.length || 0}/320 max
        </span>
      </label>

      <label className="prod-span-2">
        Keywords
        <input
          value={form.seoKeywords || ''}
          onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
          placeholder="custom frame, photo gift, wall decor (comma separated)"
        />
      </label>

      <div className="prod-seo-preview prod-span-2" aria-label="Google search preview">
        <small>Preview — Google search</small>
        <span className="prod-seo-preview__site">{SITE_NAME}</span>
        <span className="prod-seo-preview__url">{previewUrl}</span>
        <strong>{previewTitle}</strong>
        <p>{previewDescription.slice(0, 160)}{previewDescription.length > 160 ? '…' : ''}</p>
      </div>
    </div>
  )
}
