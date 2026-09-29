import { Suspense } from 'react'

import ProductGrid from '@/components/product/ProductGrid'
import ShopFilters from '@/components/product/ShopFilters'
import { parseFilters } from '@/lib/filters'
import { EMPTY_CART_NOTICE_PARAM } from '@/lib/order'

import styles from './page.module.css'

export const metadata = {
  title: 'Shop All Products | ShopStore',
  description:
    'Browse the full ShopStore catalogue of men, women, unisex and accessories with cash on delivery available in all 64 districts.',
}

/** Notices other flows can drop the visitor here with, keyed by `?message`. */
const NOTICES = {
  [EMPTY_CART_NOTICE_PARAM]:
    'Your cart is empty, so there was nothing to check out. Add something and try again.',
}

export default async function ShopPage({ searchParams }) {
  const params = await searchParams
  const filters = parseFilters(params)
  const noticeKey = typeof params?.message === 'string' ? params.message : null
  const notice = noticeKey ? NOTICES[noticeKey] : null

  return (
    <section className="section">
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Shop All</h1>
          <p className={styles.subtitle}>
            Everyday essentials from local makers and trusted brands, delivered across the
            country.
          </p>
        </header>

        {notice ? (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        ) : null}

        <div className={styles.layout}>
          <div className={styles.sidebar}>
            <Suspense fallback={null}>
              <ShopFilters />
            </Suspense>
          </div>

          <div className={styles.results}>
            <ProductGrid filters={filters} />
          </div>
        </div>
      </div>
    </section>
  )
}
