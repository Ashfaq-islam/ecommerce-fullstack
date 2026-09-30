'use client'

import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { getForProductWithSummary } from '@/services/reviewService'

import ReviewForm from './ReviewForm'
import ReviewList from './ReviewList'
import StarRating from './StarRating'
import styles from './ReviewSection.module.css'

const LOAD_ERROR = 'Something went wrong on our end. Please try again in a moment.'

const STARS = [5, 4, 3, 2, 1]

// Rendered before the first response lands, and again whenever the stored result
// belongs to an earlier request. Derived from the same builder the service uses,
// so the placeholder summary cannot disagree with the real one.
const EMPTY_SUMMARY = { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }

export default function ReviewSection({ productId }) {
  const { user } = useAuth()

  const [attempt, setAttempt] = useState(0)
  // The result is stamped with the request it belongs to, so `loading` is
  // derived rather than toggled: a new product, or a retry, is simply a request
  // key the stored result does not match yet.
  const [state, setState] = useState({ key: '', reviews: [], summary: EMPTY_SUMMARY, error: null })

  const key = `${productId}#${attempt}`
  const isCurrent = state.key === key

  useEffect(() => {
    let cancelled = false

    // Reviews travel through `reviewService` like every other resource, so the
    // loading and error paths below are driven by a real request rather than a
    // timer over mock data. The section no longer reaches into the data layer.
    getForProductWithSummary(productId).then(
      (result) => {
        if (!cancelled) {
          setState({ key, reviews: result.reviews, summary: result.summary, error: null })
        }
      },
      () => {
        if (!cancelled) {
          setState({ key, reviews: [], summary: EMPTY_SUMMARY, error: LOAD_ERROR })
        }
      },
    )

    return () => {
      cancelled = true
    }
  }, [key, productId])

  const handleRetry = useCallback(() => setAttempt((current) => current + 1), [])

  const { average, count, distribution } = isCurrent ? state.summary : EMPTY_SUMMARY

  return (
    <section className={styles.section} id="reviews" aria-labelledby="reviews-heading">
      <h2 className={styles.heading} id="reviews-heading">
        Customer Reviews
      </h2>

      <div className={styles.summary}>
        <div className={styles.overall}>
          <p className={styles.average}>{average.toFixed(1)}</p>
          <StarRating value={average} size="md" label={`Rated ${average} out of 5 on average`} />
          <p className={styles.count}>
            {count === 0 ? 'No ratings yet' : `${count} ${count === 1 ? 'review' : 'reviews'}`}
          </p>
        </div>

        <ul className={styles.distribution}>
          {STARS.map((star) => {
            const starCount = distribution[star]
            const percent = count === 0 ? 0 : Math.round((starCount / count) * 100)

            return (
              <li className={styles.distributionRow} key={star}>
                <span className={styles.distributionLabel}>{star} star</span>
                <span className={styles.distributionTrack}>
                  <span className={styles.distributionFill} style={{ width: `${percent}%` }} />
                </span>
                <span className={styles.distributionCount}>{starCount}</span>
              </li>
            )
          })}
        </ul>
      </div>

      <ReviewList
        reviews={isCurrent ? state.reviews : []}
        loading={!isCurrent}
        error={isCurrent ? state.error : null}
        onRetry={handleRetry}
      />

      <ReviewForm productId={productId} isAuthenticated={user != null} />
    </section>
  )
}
