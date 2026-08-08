import slugify from 'slugify';

export function slugFromTitle(title = '') {
  const slug = slugify(String(title).trim(), { lower: true, strict: true });
  return slug || 'product';
}

export function normalizeSlug(value = '') {
  const slug = slugify(String(value).trim(), { lower: true, strict: true });
  return slug || 'product';
}

/** Return a slug that is not used yet on Model. Appends -2, -3, … if needed. */
export async function ensureUniqueSlug(Model, desiredSlug, excludeId = null) {
  const base = normalizeSlug(desiredSlug);
  let candidate = base;
  let counter = 2;

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Model.findOne(query).select('_id').lean();
    if (!exists) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return `${base}-${Date.now()}`;
}

/** Assign a guaranteed-unique slug on create payloads */
export async function assignUniqueSlug(body, Model, { excludeId } = {}) {
  if (!body || typeof body !== 'object') return body;

  const base =
    (body.slug && String(body.slug).trim()) ||
    slugFromTitle(body.title) ||
    'product';

  body.slug = await ensureUniqueSlug(Model, base, excludeId);
  return body;
}

/** For updates: only change slug when title/slug sent and result would differ */
export async function assignUniqueSlugForUpdate(body, Model, existing, id) {
  if (!body || typeof body !== 'object') return body;
  if (body.slug === undefined && body.title === undefined) return body;

  const base =
    (body.slug !== undefined && String(body.slug).trim()) ||
    (body.title !== undefined ? slugFromTitle(body.title) : '') ||
    existing?.slug ||
    slugFromTitle(existing?.title);

  if (existing?.slug && base === existing.slug) {
    delete body.slug;
    return body;
  }

  body.slug = await ensureUniqueSlug(Model, base, id);
  return body;
}
