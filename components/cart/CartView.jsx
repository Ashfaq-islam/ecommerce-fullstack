'use client'

import Link from 'next/link'

import EmptyState from '@/components/common/EmptyState'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/format'
import { calculateOrderTotals, getRemainingForFreeDelivery } from '@/lib/shipping'

import CartItem from './CartItem'
import styles from './CartView.module.css'

export default function CartView() {
  const { items, total, itemCount, hasHydrated, removeItem, updateQuantity, clearCart } =
    useCart()

  const { shipping, total: orderTotal } = calculateOrderTotals(total)
  const remainingForFreeDelivery = getRemainingForFreeDelivery(total)

  const handleUpdateQuantity = (item, quantity) => {
    updateQuantity(item.productId, item.variantId, quantity)
  }

  const handleRemove = (item) => {
    removeItem(item.productId, item.variantId)
  }

  if (!hasHydrated) {
    return (
      <div className={styles.skeleton} aria-busy="true">
        <span className="screenReaderOnly">Loading your cart</span>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse the catalogue and add a few things you like."
        actionHref="/shop"
        actionLabel="Start shopping"
      />
    )
  }

  return (
    <div className={styles.layout}>
      <section className={styles.items} aria-label="Cart items">
        <div className={styles.itemsHeader}>
          <h2 className={styles.itemsTitle}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </h2>
          <button type="button" className={styles.clear} onClick={clearCart}>
            Clear cart
          </button>
        </div>

        <ul className={styles.list}>
          {items.map((item) => (
            <li key={`${item.productId}-${item.variantId ?? 'base'}`}>
              <CartItem
                item={item}
                onRemove={handleRemove}
                onUpdateQuantity={handleUpdateQuantity}
              />
            </li>
          ))}
        </ul>

        <Link className={styles.continue} href="/shop">
          Continue Shopping
        </Link>
      </section>

      <aside className={styles.summary} aria-label="Order summary">
        <h2 className={styles.summaryTitle}>Order Summary</h2>

        <dl className={styles.summaryRows}>
          <div className={styles.summaryRow}>
            <dt>Subtotal</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Delivery</dt>
            <dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
          </div>
        </dl>

        {remainingForFreeDelivery > 0 ? (
          <p className={styles.deliveryHint}>
            Add {formatPrice(remainingForFreeDelivery)} more for free delivery.
          </p>
        ) : (
          <p className={styles.deliveryHint}>Your order qualifies for free delivery.</p>
        )}

        <div className={styles.totalRow}>
          <span>Total</span>
          <span className={styles.totalValue}>{formatPrice(orderTotal)}</span>
        </div>

        <Link className={styles.checkout} href="/checkout">
          Checkout
        </Link>

        <p className={styles.note}>Cash on delivery available in all 64 districts.</p>
      </aside>
    </div>
  )
}
