import Link from 'next/link'

import ProductGrid from '@/components/product/ProductGrid'

import styles from './FeaturedGrid.module.css'

const FEATURED_COUNT = 8

export default function FeaturedGrid() {
  return (
    <section className="section" aria-labelledby="featured-heading">
      <div className="container">
        <div className={styles.head}>
          <h2 id="featured-heading" className={styles.heading}>
            Featured Products
          </h2>
          <Link className={styles.viewAll} href="/shop">
            View all
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </div>

        <ProductGrid limit={FEATURED_COUNT} featured />
      </div>
    </section>
  )
}
