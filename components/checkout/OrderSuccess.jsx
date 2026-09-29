'use client'

import { useSyncExternalStore } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import EmptyState from '@/components/common/EmptyState'
import { formatPrice } from '@/lib/format'
import {
  getPaymentMethodLabel,
  getStashedOrderSnapshot,
  subscribeToStashedOrder,
} from '@/lib/order'

import styles from './OrderSuccess.module.css'

/**
 * Distinguishes "the client has not read storage yet" from "there is no order",
 * so a hard refresh shows the skeleton instead of flashing the empty state.
 */
const PENDING_ORDER = 'pending'

const getServerOrderSnapshot = () => PENDING_ORDER

function CheckIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}

function formatPlacedAt(isoString) {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function OrderSuccess() {
  const order = useSyncExternalStore(
    subscribeToStashedOrder,
    getStashedOrderSnapshot,
    getServerOrderSnapshot,
  )

  if (order === PENDING_ORDER) {
    return (
      <div className={styles.skeleton} aria-busy="true">
        <span className="screenReaderOnly">Loading your order</span>
      </div>
    )
  }

  if (!order) {
    return (
      <EmptyState
        title="No recent order"
        description="We could not find a recent order on this device. Start a new one from the shop."
        actionHref="/shop"
        actionLabel="Continue Shopping"
      />
    )
  }

  const { shippingAddress, items, subtotal, shipping, total } = order
  const placedAt = formatPlacedAt(order.placedAt)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  return (
    <div className={styles.layout}>
      <div className={styles.card}>
        <div className={styles.banner}>
          <span className={styles.bannerIcon}>
            <CheckIcon />
          </span>
          <h2 className={styles.bannerTitle}>Order confirmed</h2>
          <p className={styles.bannerText}>
            Thank you{shippingAddress.fullName ? `, ${shippingAddress.fullName.split(' ')[0]}` : ''}.
            We will call {shippingAddress.phone} to confirm delivery.
          </p>
        </div>

        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>Order number</dt>
            <dd className={styles.orderNumber}>{order.orderNumber}</dd>
          </div>
          {placedAt ? (
            <div className={styles.fact}>
              <dt>Placed</dt>
              <dd>{placedAt}</dd>
            </div>
          ) : null}
          <div className={styles.fact}>
            <dt>Estimated delivery</dt>
            <dd>{order.estimatedDelivery?.label}</dd>
          </div>
          <div className={styles.fact}>
            <dt>Payment</dt>
            <dd>{getPaymentMethodLabel(order.paymentMethod)}</dd>
          </div>
        </dl>

        <section className={styles.section} aria-labelledby="delivery-heading">
          <h3 className={styles.sectionTitle} id="delivery-heading">
            Delivery address
          </h3>
          <address className={styles.address}>
            {shippingAddress.fullName}
            <br />
            {shippingAddress.address}
            <br />
            {shippingAddress.city}, {shippingAddress.district}
          </address>
        </section>

        <section className={styles.section} aria-labelledby="items-heading">
          <h3 className={styles.sectionTitle} id="items-heading">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </h3>

          <ul className={styles.items}>
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.variantId ?? 'base'}`}
                className={styles.item}
              >
                <span className={styles.thumb}>
                  <Image
                    className={styles.image}
                    src={item.image}
                    alt=""
                    fill
                    sizes="56px"
                  />
                  <span className={styles.qty} aria-hidden="true">
                    {item.quantity}
                  </span>
                </span>
                <span className={styles.itemBody}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemMeta}>
                    {[item.size, item.color].filter(Boolean).join(' · ') || 'Standard'}
                  </span>
                </span>
                <span className={styles.itemPrice}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <dl className={styles.totals}>
          <div className={styles.totalRow}>
            <dt>Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className={styles.totalRow}>
            <dt>Shipping</dt>
            <dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
          </div>
          <div className={`${styles.totalRow} ${styles.totalRowStrong}`}>
            <dt>Total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>

        <Link className={styles.action} href="/shop">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
