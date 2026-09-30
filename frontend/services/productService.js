import { ApiError, DATA_SOURCE, request, requestAllPages } from '@/lib/apiClient'
import {
  applyClientFilters,
  buildFacets,
  groupVariantsByProduct,
  normalizeProduct,
  normalizeProducts,
} from '@/lib/catalogMappers'

/**
 * Products service.
 *
 * This is the only module product data should be read through. Components and
 * hooks call these functions and never import `data/mockProducts` or call
 * `fetch`: every read goes through `lib/apiClient`, which decides between the
 * mock handlers and a real DCMS call based on `NEXT_PUBLIC_DATA_SOURCE`.
 *
 * Records from either source are put through the same `lib/catalogMappers`
 * functions before they leave this module, so components always receive one
 * product shape regardless of which transport answered. Keeping that here
 * rather than in `apiClient` means the transport stays a dumb pipe and the
 * domain vocabulary stays with the service.
 */

const IS_DCMS = DATA_SOURCE === 'dcms'

/** DCMS page size; 100 is the documented maximum. */
const DCMS_PAGE_SIZE = 100

/** Relations to inline so brand/category arrive as objects, not UUIDs. */
const PRODUCT_EXPAND = 'brand,category'

/**
 * Loads every variant record so `normalizeProducts` can attach them.
 *
 * DCMS keeps variants in their own collection keyed by a product relation rather
 * than embedding them, and they are what supply a product's sizes, colours and
 * per-variant stock. Fetching the collection once and grouping locally avoids an
 * N+1 request per product. A failure here is not fatal — products still render,
 * they just have no size or colour options — so it resolves to an empty map.
 */
async function loadVariantsByProduct() {
  if (!IS_DCMS) {
    return new Map()
  }

  try {
    const variants = await requestAllPages('/variants', {
      query: { limit: DCMS_PAGE_SIZE },
    })

    return groupVariantsByProduct(variants)
  } catch {
    return new Map()
  }
}

/**
 * Resolves the products matching `filters`, which accepts the same keys the
 * shop query string uses: `category`, `brand`, `badge`, `size`, `color`,
 * `minPrice`, `maxPrice` and `limit`. Each selection takes a single value or an
 * array of values.
 */
export async function getAll(filters = {}) {
  // Forwarded to DCMS and translated by `toDcmsQuery`, which keeps only the
  // filters the API can express (featured, price range, status) and drops the
  // display-string ones. `expand` inlines the brand/category relations so they
  // arrive as objects rather than UUIDs, which is the API's own relation
  // expansion — no manual per-record fetching needed.
  const query = IS_DCMS
    ? { ...filters, limit: filters.limit ?? DCMS_PAGE_SIZE, expand: PRODUCT_EXPAND }
    : filters

  const records = await requestAllPages('/products', { query })
  const products = normalizeProducts(records, await loadVariantsByProduct())

  // The display-string filters (category, brand, badge, size, colour) cannot be
  // expressed in DCMS query language, so they are applied here. The mock handlers
  // already filtered, making this a no-op there.
  return IS_DCMS ? applyClientFilters(products, filters) : products
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
  const target = String(slug ?? '').trim().toLowerCase()

  if (target === '') {
    return null
  }

  // DCMS single-record reads are reached by id, and its products endpoint
  // currently answers 404 for records that are listed and publicly readable —
  // `GET /categories/{id}` works while `GET /products/{id}` does not. Rather than
  // have every product page 404, the slug is resolved against the catalogue.
  // Swapping this for a direct fetch is a one-line change once that route works.
  if (IS_DCMS) {
    const products = await getAll({})
    const match = products.find(
      (product) => product.slug.toLowerCase() === target,
    )

    return match ?? null
  }

  try {
    const record = await request(`/products/${encodeURIComponent(slug)}`)
    return record ? normalizeProduct(record) : null
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

  return getAll({ featured: 'true', limit })
}

/**
 * Derives the filter options from the catalogue so the sidebar never hardcodes
 * facet lists.
 *
 * The mock transport has a `/products/facets` route. DCMS exposes no such route,
 * so the same derivation runs here over the catalogue instead — `buildFacets` is
 * shared, which is what keeps the two sources from drifting.
 */
export async function getFacets() {
  if (IS_DCMS) {
    return buildFacets(await getAll({}))
  }

  return request('/products/facets')
}