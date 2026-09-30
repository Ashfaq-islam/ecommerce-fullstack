'use client'

import Image from 'next/image'
import Link from 'next/link'

import { formatPrice } from '@/lib/format'

import styles from './CartItem.module.css'

const THUMBNAIL_SIZES = '72px'

export default function CartItem({ item, onRemove, onUpdateQuantity }) {
  const lineTotal = item.price * item.quantity
  const variantLabel = [item.size, item.color].filter(Boolean).join(' · ')
  const atCeiling = item.quantity >= (item.stock ?? Number.POSITIVE_INFINITY)
  const atFloor = item.quantity <= 1

  return (
    <article className={styles.item}>
      <Link className={styles.thumbnail} href={`/products/${item.slug}`}>
        <Image
          className={styles.image}
          src={item.image}
          alt={item.name}
          fill
          sizes={THUMBNAIL_SIZES}
        />
      </Link>

      <div className={styles.details}>
        <p className={styles.brand}>{item.brand}</p>
        <h3 className={styles.title}>
          <Link className={styles.titleLink} href={`/products/${item.slug}`}>
            {item.name}
          </Link>
        </h3>

        {variantLabel ? <p className={styles.variant}>{variantLabel}</p> : null}
        <p className={styles.unitPrice}>{formatPrice(item.price)} each</p>

        <div className={styles.controls}>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.stepperButton}
              onClick={() => onUpdateQuantity(item, item.quantity - 1)}
              disabled={atFloor}
              aria-label={`Decrease quantity of ${item.name}`}
            >
              &minus;
            </button>
            <span className={styles.stepperValue} aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              className={styles.stepperButton}
              onClick={() => onUpdateQuantity(item, item.quantity + 1)}
              disabled={atCeiling}
              aria-label={`Increase quantity of ${item.name}`}
            >
              +
            </button>
          </div>

          <button
            type="button"
            className={styles.remove}
            onClick={() => onRemove(item)}
            aria-label={`Remove ${item.name} from cart`}
          >
            Remove
          </button>
        </div>
      </div>

      <p className={styles.lineTotal}>{formatPrice(lineTotal)}</p>
    </article>
  )
}
