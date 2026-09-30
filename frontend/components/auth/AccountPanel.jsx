'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import EmptyState from '@/components/common/EmptyState'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/format'
import { getMyOrders, getOrderStatusLabels } from '@/services/orderService'

import styles from './AccountPanel.module.css'

function formatDate(isoString) {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date)
}

function formatMemberSince(isoString) {
  return formatDate(isoString) ?? 'Recently joined'
}

export default function AccountPanel() {
  const router = useRouter()
  // Loaded through the transport, so the DCMS can own the status vocabulary.
  // Falls back to the raw status key when unavailable.
  const [statusLabels, setStatusLabels] = useState({})

  useEffect(() => {
    let cancelled = false

    getOrderStatusLabels().then((labels) => {
      if (!cancelled) {
        setStatusLabels(labels)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])
  const { user, status, isAuthenticated, logout } = useAuth()

  const [orderState, setOrderState] = useState({
    forUserId: null,
    status: 'loading',
    orders: null,
    error: null,
  })
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Protection is a client concern here because the session lives in
  // localStorage, so there is no token for the server to check.
  useEffect(() => {
    if (status !== 'unauthenticated') {
      return
    }

    router.replace('/login?next=/account')
  }, [status, router])

  useEffect(() => {
    if (!user) {
      return
    }

    let cancelled = false
    const userId = user.id

    // `user` keys the effect, but identity is resolved from the stored token.
    getMyOrders()
      .then((result) => {
        if (!cancelled) {
          setOrderState({ forUserId: userId, status: 'ready', orders: result, error: null })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setOrderState({
            forUserId: userId,
            status: 'error',
            orders: null,
            error: error instanceof Error ? error.message : 'We could not load your orders.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [user])

  // State is tagged with the user it was fetched for, so a signed-in swap never
  // shows the previous account's orders while the new request is in flight.
  const isStale = orderState.forUserId !== user?.id
  const isLoadingOrders = isStale || orderState.status === 'loading'
  const orders = isStale ? null : orderState.orders
  const ordersError = isStale ? null : orderState.error

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)
    await logout()
    router.replace('/login')
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.guard} aria-busy="true">
        <span className="screenReaderOnly">Checking your session</span>
      </div>
    )
  }

  const hasOrders = Array.isArray(orders) && orders.length > 0

  return (
    <div className={styles.layout}>
      <section className={styles.profile} aria-labelledby="profile-heading">
        <div className={styles.profileHeader}>
          <h2 className={styles.sectionTitle} id="profile-heading">
            Profile
          </h2>
          <button
            type="button"
            className={styles.logout}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Signing out' : 'Sign out'}
          </button>
        </div>

        <div className={styles.identity}>
          <span className={styles.avatar} aria-hidden="true">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className={styles.name}>{user.name}</p>
            <p className={styles.memberSince}>
              Member since {formatMemberSince(user.createdAt)}
            </p>
          </div>
        </div>

        <dl className={styles.details}>
          <div className={styles.detail}>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className={styles.detail}>
            <dt>Phone</dt>
            <dd>{user.phone ?? 'Not provided'}</dd>
          </div>
          <div className={styles.detail}>
            <dt>Account ID</dt>
            <dd className={styles.mono}>{user.id}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.orders} aria-labelledby="orders-heading">
        <h2 className={styles.sectionTitle} id="orders-heading">
          Order History
        </h2>

        {isLoadingOrders ? (
          <div className={styles.ordersSkeleton} aria-busy="true">
            <span className="screenReaderOnly">Loading your orders</span>
          </div>
        ) : ordersError ? (
          <p className={styles.ordersError} role="alert">
            {ordersError}
          </p>
        ) : !hasOrders ? (
          <EmptyState
            title="No orders yet"
            description="When you place an order it will show up here with its delivery status."
            actionHref="/shop"
            actionLabel="Start shopping"
          />
        ) : (
          <ul className={styles.orderList}>
            {orders.map((order) => {
              const placedAt = formatDate(order.placedAt)
              const itemCount = order.items.reduce(
                (count, item) => count + item.quantity,
                0,
              )

              return (
                <li key={order.id ?? order.orderNumber} className={styles.order}>
                  <div className={styles.orderHeader}>
                    <div>
                      <p className={styles.orderNumber}>{order.orderNumber}</p>
                      <p className={styles.orderDate}>
                        {placedAt ? `Placed on ${placedAt}` : null}
                      </p>
                    </div>
                    <span className={styles.status} data-status={order.status}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </div>

                  <ul className={styles.orderItems}>
                    {order.items.map((item) => (
                      <li
                        key={`${item.productId}-${item.variantId ?? 'base'}`}
                        className={styles.orderItem}
                      >
                        <span className={styles.thumb}>
                          <Image
                            className={styles.image}
                            src={item.image}
                            alt=""
                            fill
                            sizes="44px"
                          />
                        </span>
                        <span className={styles.orderItemBody}>
                          <span className={styles.orderItemName}>{item.name}</span>
                          <span className={styles.orderItemMeta}>
                            {[item.size, item.color].filter(Boolean).join(' · ') || 'Standard'}
                            {' · '}
                            Qty {item.quantity}
                          </span>
                        </span>
                        <span className={styles.orderItemPrice}>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className={styles.orderFooter}>
                    <span className={styles.orderCount}>
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className={styles.orderTotal}>{formatPrice(order.total)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <Link className={styles.continueLink} href="/shop">
          Continue Shopping
        </Link>
      </section>
    </div>
  )
}
