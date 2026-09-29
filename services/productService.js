import { ApiError, request } from '@/lib/apiClient'

/**
 * Products service.
 *
 * This is the only module product data should be read through. Components and
 * hooks call these functions and never import `data/mockProducts` or call
 * `fetch`: every read goes through `lib/apiClient`, which decides between the
 * mock handlers and a real DCMS call based on `NEXT_PUBLIC_DATA_SOURCE`.
 *
 * Because selection semantics (filtering, featured ranking, facet derivation)
 * live in the mock handlers, the equivalent work is expected to happen
 * server-side against the DCMS. These functions therefore stay thin on purpose.
 */

/**
 * @deprecated The artificial latency now lives in the apiClient mock transport,
 * which needs it to make loading states reachable. Retained so existing imports
 * do not break; it is no longer applied here.
 */
export const PRODUCT_SERVICE_LATENCY_MS = 300

/**
 * Resolves the products matching `filters`, which accepts the same keys the
 * shop query string uses: `category`, `brand`, `badge`, `size`, `color`,
 * `minPrice`, `maxPrice` and `limit`. Each selection takes a single value or an
 * array of values.
 */
export async function getAll(filters = {}) {
  return request('/products', { query: filters })
}

/**
 * Resolves one product by slug, or `null` when nothing matches, so the page can
 * call `notFound()` instead of rendering an empty shell.
 *
 * A DCMS signals a missing product with a 404 response, which the client turns
 * into a thrown `ApiError`. Letting that propagate would break the page contract:
 * the mock transport resolves `null` here, so a 404 must resolve `null` too or the
 * same missing product renders 404 in one data source and 500 in the other. Every
 * other failure (5xx, network) still throws, so a real outage is not mistaken for
 * a missing product.
 */
export async function getBySlug(slug) {
  try {
    return await request(`/products/${encodeURIComponent(slug)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

/**
 * Resolves the badged products for the home page.
 *
 * `limit` accepts a bare number or `{ limit }`, matching `getCategories`. A bare
 * number is easy to pass by accident, and a destructured object signature would
 * silently ignore it and fall back to the default.
 */
export async function getFeatured(options = {}) {
  const limit = typeof options === 'number' ? options : options?.limit

  return request('/products', { query: { featured: 'true', limit } })
}

/**
 * Derives the filter options from the catalogue so the sidebar never hardcodes
 * facet lists. The real endpoint is expected to return the same shape.
 */
export async function getFacets() {
  return request('/products/facets')
}
