'use client'

import { useState } from 'react'

import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import LoadingState from '@/components/common/LoadingState'

import ReviewCard from './ReviewCard'
import styles from './ReviewList.module.css'

const PAGE_SIZE = 10

/**
 * Renders one product's reviews with client-side paging. Loading, error and
 * empty are handled here so the section above only has to pass state through.
 */
export default function ReviewList({ reviews = [], loading = false, error = null, onRetry = null }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [trackedReviews, setTrackedReviews] = useState(reviews)

  // Paging belongs to a single list of reviews, so a new set starts from the
  // top rather than inheriting how far the previous one was expanded. Adjusting
  // during render avoids the extra pass an effect would cost, and React discards
  // this render's output before committing.
  if (trackedReviews !== reviews) {
    setTrackedReviews(reviews)
    setVisibleCount(PAGE_SIZE)
  }

  if (loading) {
    return <LoadingState label="Loading reviews" />
  }

  if (error) {
    return (
      <ErrorState
        title="We could not load the reviews"
        description={error}
        actionLabel={onRetry ? 'Try again' : null}
        onRetry={onRetry}
      />
    )
  }

  if (!reviews.length) {
    return <EmptyState title="No reviews yet. Be the first to review!" />
  }

  const visibleReviews = reviews.slice(0, visibleCount)
  const remaining = reviews.length - visibleReviews.length

  return (
    <div className={styles.list}>
      <ul className={styles.items}>
        {visibleReviews.map((review) => (
          <li key={review.id}>
            <ReviewCard review={review} />
          </li>
        ))}
      </ul>

      {remaining > 0 ? (
        <div className={styles.more}>
          <Button
            variant="secondary"
            onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
            disabled={loading}
          >
            Load more reviews
          </Button>
          <span className={styles.remaining}>
            Showing {visibleReviews.length} of {reviews.length}
          </span>
        </div>
      ) : null}
    </div>
  )
}
