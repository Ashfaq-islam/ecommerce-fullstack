'use client'

import ErrorState from '@/components/common/ErrorState'

export default function ProductError({ reset }) {
  return (
    <section className="section">
      <div className="container">
        <ErrorState
          title="We could not load this product"
          description="Something went wrong while fetching the product details. Please try again."
          actionLabel="Try again"
          onRetry={reset}
        />
      </div>
    </section>
  )
}
