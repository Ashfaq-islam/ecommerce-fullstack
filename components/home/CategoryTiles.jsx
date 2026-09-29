import Image from 'next/image'
import Link from 'next/link'

import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import { getCategories } from '@/services/categoryService'

import styles from './CategoryTiles.module.css'

const TILE_COUNT = 4
const TILE_IMAGE_SIZES = '(min-width: 768px) 25vw, 50vw'

export default async function CategoryTiles() {
  let categories

  try {
    categories = await getCategories({ limit: TILE_COUNT })
  } catch {
    return (
      <section className="section" aria-labelledby="categories-heading">
        <div className="container">
          <h2 id="categories-heading" className={styles.heading}>
            Shop by Category
          </h2>
          <ErrorState
            title="We could not load categories right now"
            description="Something went wrong on our end. Please try again in a moment."
          />
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return (
      <section className="section" aria-labelledby="categories-heading">
        <div className="container">
          <h2 id="categories-heading" className={styles.heading}>
            Shop by Category
          </h2>
          <EmptyState
            title="No categories available"
            description="Categories are being set up. Please check back shortly."
            actionHref="/shop"
            actionLabel="Browse all products"
          />
        </div>
      </section>
    )
  }

  return (
    <section className="section" aria-labelledby="categories-heading">
      <div className="container">
        <h2 id="categories-heading" className={styles.heading}>
          Shop by Category
        </h2>

        <ul className={styles.grid}>
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                className={styles.tile}
                href={`/shop?category=${category.slug}`}
              >
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes={TILE_IMAGE_SIZES}
                  className={styles.image}
                />
                <span className={styles.scrim} />
                <span className={styles.label}>{category.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
