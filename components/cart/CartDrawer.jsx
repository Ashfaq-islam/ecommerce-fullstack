'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

import EmptyState from '@/components/common/EmptyState'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/format'

import CartItem from './CartItem'
import styles from './CartDrawer.module.css'

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export default function CartDrawer({ isOpen, onClose }) {
  const { items, total, itemCount, hasHydrated, removeItem, updateQuantity } = useCart()
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    return () => {
      body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleUpdateQuantity = (item, quantity) => {
    updateQuantity(item.productId, item.variantId, quantity)
  }

  const handleRemove = (item) => {
    removeItem(item.productId, item.variantId)
  }

  return (
    <>
      <div className={styles.scrim} onClick={onClose} />

      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            Your Cart
            {hasHydrated && itemCount > 0 ? (
              <span className={styles.count}>{itemCount}</span>
            ) : null}
          </h2>

          <button
            type="button"
            ref={closeButtonRef}
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close cart"
          >
            <CloseIcon />
          </button>
        </div>

        <div className={styles.body}>
          {!hasHydrated ? null : items.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              description="Once you add something it will show up here."
              actionHref="/shop"
              actionLabel="Start shopping"
            />
          ) : (
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
          )}
        </div>

        {items.length > 0 ? (
          <div className={styles.footer}>
            <div className={styles.subtotal}>
              <span>Subtotal</span>
              <span className={styles.subtotalValue}>{formatPrice(total)}</span>
            </div>
            <p className={styles.note}>Shipping and taxes calculated at checkout.</p>

            <Link className={styles.checkout} href="/checkout" onClick={onClose}>
              Checkout
            </Link>

            <div className={styles.footerLinks}>
              <Link className={styles.continue} href="/shop" onClick={onClose}>
                Continue Shopping
              </Link>
              <Link className={styles.viewCart} href="/cart" onClick={onClose}>
                View Cart
              </Link>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  )
}
