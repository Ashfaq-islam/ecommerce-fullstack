'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { formatPrice, getDiscountPercent } from '@/lib/format'

import styles from './ProductCard.module.css'

const IMAGE_WIDTH = 800
const IMAGE_HEIGHT = 800
const IMAGE_SIZES = '(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw'
const SELECT_LABEL = 'Select options'

export default function ProductCard({ product, selectLabel = SELECT_LABEL, onSelectOptions }) {
  const router = useRouter()
  const href = `/products/${product.slug}`
  const discount = getDiscountPercent(product.price, product.compareAtPrice)

  const handleSelect = () => {
    if (onSelectOptions) {
      onSelectOptions(product)
      return
    }

    router.push(href)
  }

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Image
          className={styles.image}
          src={product.image}
          alt={product.name}
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
          sizes={IMAGE_SIZES}
        />

        {product.imageHover ? (
          <Image
            className={styles.hoverImage}
            src={product.imageHover}
            alt=""
            aria-hidden="true"
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            sizes={IMAGE_SIZES}
          />
        ) : null}

        {product.badge ? <span className={styles.badge}>{product.badge}</span> : null}
      </div>

      <div className={styles.body}>
        {product.brand ? <p className={styles.brand}>{product.brand}</p> : null}

        <h3 className={styles.name}>
          <Link className={styles.nameLink} href={href}>
            {product.name}
          </Link>
        </h3>

        <p className={styles.prices}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {product.compareAtPrice ? (
            <>
              <span className={styles.compareAt}>{formatPrice(product.compareAtPrice)}</span>
              {discount ? <span className={styles.discount}>Save {discount}%</span> : null}
            </>
          ) : null}
        </p>

        <button type="button" className={styles.selectButton} onClick={handleSelect}>
          {selectLabel}
        </button>
      </div>
    </article>
  )
}
