'use client'

import { useCallback, useEffect, useState } from 'react'

import { getMockReviewsForProduct, getReviewSummary } from '@/data/mockReviews'
import { useAuth } from '@/hooks/useAuth'

import ReviewForm from './ReviewForm'
import ReviewList from './ReviewList'
import StarRating from './StarRating'
import styles from './ReviewSection.module.css'

const FETCH_DELAY_MS = 300

const LOAD_ERROR = 'Something went wrong on our end. Please try again in a moment.'

const STARS = [5, 4, 3, 2, 1]

// Wrapped in a promise so the section exercises the same loading and error
// paths a real request would, instead of painting from memory on first render.
function loadMockReviews(productId) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getMockReviewsForProduct(productId)), FETCH_DELAY_MS)
  })
}

export default function ReviewSection({ productId }) {
  const { user } = useAuth()

  const [attempt, setAttempt] = useState(0)
  // The result is stamped with the request it belongs to, so `loading` is
  // derived rather than toggled: a new product, or a retry, is simply a request
  // key the stored result does not match yet.
  const [state, setState] = useState({ key: '', reviews: [], error: null })

  const key = `${productId}#${attempt}`
  const isCurrent = state.key === key

  useEffect(() => {
    let cancelled = false

    loadMockReviews(productId).then(
      (reviews) => {
        if (!cancelled) {
          setState({ key, reviews, error: null })
        }
      },
      () => {
        if (!cancelled) {
          setState({ key, reviews: [], error: LOAD_ERROR })
        }
      },
    )

    return () => {
      cancelled = true
    }
  }, [key, productId])

  const handleRetry = useCallback(() => setAttempt((current) => current + 1), [])

  const { average, count, distribution } = getReviewSummary(productId)

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
