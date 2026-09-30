import { DATA_SOURCE, request, requestAllPages } from '@/lib/apiClient'
import { normalizeCategory } from '@/lib/catalogMappers'

/**
 * Categories service. The only module category data should be read through, so
 * the mock array can be swapped for a real DCMS endpoint without touching the UI.
 *
 * Reads go through `lib/apiClient`, which owns the `NEXT_PUBLIC_DATA_SOURCE`
 * switch between the mock handlers and a real HTTP call.
 */

const IS_DCMS = DATA_SOURCE === 'dcms'

/** DCMS page size; 100 is the documented maximum. */
const DCMS_PAGE_SIZE = 100

/**
 * Resolves the category list, newest merchandising order first.
 *
 * `limit` may be passed as `getCategories({ limit })` (matching `getAll`) or as a
 * bare `getCategories(3)`. Both are accepted because a number is silently
 * ignored by a destructured object signature, which is an easy trap.
 */
export async function getCategories(options = {}) {
  const limit = typeof options === 'number' ? options : options?.limit

  // DCMS paginates with an opaque cursor, so a `limit` alone can only ever
  // return the first page. The full list is walked and trimmed here, which also
  // keeps the header mega-menu complete — it derives sub-links from every
  // category and a truncated list would silently drop menu columns.
  if (IS_DCMS) {
    const records = await requestAllPages('/categories', {
      query: { limit: DCMS_PAGE_SIZE, sort: 'sort_order' },
    })

    const categories = records
      .map(normalizeCategory)
      .filter(Boolean)
      .sort((a, b) => a.sortOrder - b.sortOrder)

    return Number.isFinite(limit) && limit >= 0 ? categories.slice(0, limit) : categories
  }

  const categories = await request('/categories', { query: { limit } })

  return (categories ?? []).map(normalizeCategory).filter(Boolean)
}