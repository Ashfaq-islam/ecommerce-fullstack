import { DATA_SOURCE, request, requestAllPages } from '@/lib/apiClient'
import { normalizeReview } from '@/lib/catalogMappers'

/**
 * Reviews service.
 *
 * Reviews used to be read straight out of `data/mockReviews` by
 * `components/product/ReviewSection`, which was the one resource in the app
 * bypassing the service layer entirely — so there was nothing to point at a
 * real endpoint. This service is that seam: the section now calls these
 * functions and never touches the data layer.
 *
 * As with products and categories, records from either source go through the
 * shared `normalizeReview`, so the component receives one review shape.
 */

const IS_DCMS = DATA_SOURCE === 'dcms'

/** DCMS page size; 100 is the documented maximum. */
const DCMS_PAGE_SIZE = 100

const STARS = [1, 2, 3, 4, 5]

/**
 * Resolves the reviews for one product, newest first.
 *
 * Only approved reviews are returned. DCMS keeps moderation state on the review
 * record itself, so an unfiltered read would show customers other people's
 * pending and rejected submissions; `filter[status]` scopes the query instead of
 * trusting the endpoint to have done it.
 */
export async function getForProduct(productId, options = {}) {
  const id = String(productId ?? '').trim()

  if (id === '') {
    return []
  }

  const limit = typeof options === 'number' ? options : options?.limit

  const records = IS_DCMS
    ? await requestAllPages('/reviews', {
        query: { limit: DCMS_PAGE_SIZE, 'filter[product]': id, 'filter[status]': 'approved' },
      })
    : await request('/reviews', { query: { productId: id, limit } })

  return (records ?? []).map(normalizeReview).filter(Boolean)
}

/**
 * Derives the rating summary the review section renders: the mean, the total,
 * and the per-star distribution.
 *
 * Computed from the review list rather than read from a dedicated endpoint, so
 * the numbers can never disagree with the reviews shown directly beneath them.
 * `distribution` always has a 1-5 key, and both `average` and `count` are
 * always present, so the UI has no empty-state guards to write.
 */
export function summarize(reviews) {
  const distribution = Object.fromEntries(STARS.map((star) => [star, 0]))
  let total = 0

  for (const review of reviews) {
    const rating = Math.round(Number(review?.rating))

    if (rating >= 1 && rating <= 5) {
      distribution[rating] += 1
      total += rating
    }
  }

  const count = reviews.length

  return {
    average: count > 0 ? total / count : 0,
    count,
    distribution,
  }
}

/** Convenience wrapper for callers that need both the list and its summary. */
export async function getForProductWithSummary(productId, options = {}) {
  const reviews = await getForProduct(productId, options)

  return { reviews, summary: summarize(reviews) }
}