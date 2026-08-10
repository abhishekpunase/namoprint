/** Max products per API page (must match backend validator max). */
export const STOREFRONT_PAGE_SIZE = 500;

export function withStorefrontListQuery(query = '') {
  const raw = query.startsWith('?') ? query.slice(1) : query;
  const params = new URLSearchParams(raw);
  if (!params.has('limit')) params.set('limit', String(STOREFRONT_PAGE_SIZE));
  if (!params.has('page')) params.set('page', '1');
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
