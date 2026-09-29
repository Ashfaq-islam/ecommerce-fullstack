import { request } from '@/lib/apiClient'

/**
 * Categories service. The only module category data should be read through, so
 * the mock array can be swapped for a real DCMS endpoint without touching the UI.
 *
 * Reads go through `lib/apiClient`, which owns the `NEXT_PUBLIC_DATA_SOURCE`
 * switch between the mock handlers and a real HTTP call.
 */

/**
 * @deprecated The artificial latency now lives in the apiClient mock transport,
 * which needs it to make loading states reachable. Retained so existing imports
 * do not break; it is no longer applied here.
 */
export const CATEGORY_SERVICE_LATENCY_MS = 300

/**
 * Resolves the category list, newest merchandising order first.
 *
 * `limit` may be passed as `getCategories({ limit })` (matching `getAll`) or as a
 * bare `getCategories(3)`. Both are accepted because a number is silently
 * ignored by a destructured object signature, which is an easy trap.
 */
export async function getCategories(options = {}) {
  const limit = typeof options === 'number' ? options : options?.limit

  return request('/categories', { query: { limit } })
}
