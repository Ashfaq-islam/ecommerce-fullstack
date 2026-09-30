import { request } from '@/lib/apiClient'

/**
 * Delivery configuration service.
 *
 * Geography is read through `lib/apiClient` like every other resource, so the
 * 64-district list can come from a real DCMS endpoint without touching the
 * checkout form. It is asynchronous because it now travels through the same
 * transport as the rest of the catalogue.
 */

const DISTRICTS_FALLBACK = []

/**
 * Resolves the Bangladesh district list for the delivery dropdown.
 *
 * The dropdown must not be blocked if the list fails to load, so this resolves to
 * an empty array rather than rejecting; the form shows a retryable message
 * instead. Callers that need to distinguish "empty" from "failed" should use
 * `getDistricts` through the form's own error state.
 */
export async function getDistricts() {
  try {
    const districts = await request('/meta/districts')
    return Array.isArray(districts) ? districts : DISTRICTS_FALLBACK
  } catch {
    return DISTRICTS_FALLBACK
  }
}
