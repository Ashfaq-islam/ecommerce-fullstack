'use client'

import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import LoadingState from '@/components/common/LoadingState'
import { useProducts } from '@/hooks/useProducts'

import ProductCard from './ProductCard'
import styles from './ProductGrid.module.css'

const SKELETON_COUNT = 8

function ProductCardSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={styles.skeletonMedia} />
      <div className={styles.skeletonBody}>
        <div className={`${styles.skeletonLine} ${styles.skeletonBrand}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonPrice}`} />
      </div>
    </div>
  )
}

export default function ProductGrid({
  limit,
  category,
  brand,
  badge,
  filters,
  featured = false,
  onSelectOptions,
}) {
  const { products, isLoading, error } = useProducts({
    limit,
    category,
    brand,
    badge,
    source: featured ? 'featured' : 'all',
    ...filters,
  })

  if (error) {
    return (
      <ErrorState
        title="We could not load products right now"
        description="Something went wrong on our end. Please try again in a moment."
      />
    )
  }

  if (isLoading) {
    return (
      <LoadingState label="Loading products">
        <ul className={styles.grid}>
          {Array.from({ length: limit ?? SKELETON_COUNT }, (_, index) => (
            <li key={index}>
              <ProductCardSkeleton />
            </li>
          ))}
        </ul>
      </LoadingState>
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="We could not match anything to this selection. Try clearing a filter or two."
        actionHref="/shop"
        actionLabel="Browse all products"
      />
    )
  }

  return (
    <ul className={styles.grid}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} onSelectOptions={onSelectOptions} />
        </li>
      ))}
    </ul>
  )
}
