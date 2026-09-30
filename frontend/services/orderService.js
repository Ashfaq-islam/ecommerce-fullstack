import { ApiError, request } from '@/lib/apiClient'
import { getStoredToken } from '@/services/authService'
import { validateCheckoutForm } from '@/lib/order'
import { calculateOrderTotals, getEstimatedDeliveryWindow } from '@/lib/shipping'

// Human-readable order statuses, resolved through the transport so the UI has
// one import surface and still works when the DCMS owns the vocabulary. The
// caller keeps a raw-status fallback if the lookup fails.
let orderStatusLabels = null

/** `{ processing: 'Processing', ... }` for rendering order history rows. */
export async function getOrderStatusLabels() {
  if (orderStatusLabels === null) {
    try {
      const { labels } = await request('/orders/status-labels')
      orderStatusLabels = labels ?? {}
    } catch {
      orderStatusLabels = {}
    }
  }

  return orderStatusLabels
}

/**
 * Places an order through the orders endpoint.
 *
 * Client-side validation runs first so the form can show precise field errors
 * without a round trip, but the server is authoritative: it owns the order
 * number, the timestamp and the totals, and a placed order is persisted so it
 * appears in `getMyOrders()` on the next visit. Previously this built the order
 * locally and threw it away, so checkout confirmed an order that order history
 * had never heard of.
 *
 * Rejects with an `ApiError` when the payload is incomplete, so the form can
 * surface a real error state instead of silently confirming a broken order.
 */
export async function createOrder(orderData) {
  const items = Array.isArray(orderData?.items) ? orderData.items : []

  if (items.length === 0) {
    throw new ApiError('Your cart is empty. Add an item before placing an order.', {
      status: 400,
      code: 'cart_empty',
    })
  }

  const shippingAddress = orderData?.shippingAddress ?? {}
  const fieldErrors = validateCheckoutForm(shippingAddress)

  if (Object.keys(fieldErrors).length > 0) {
    throw new ApiError(
      'Some delivery details are missing or invalid. Please review the form.',
      { status: 400, code: 'invalid_checkout' },
    )
  }

  const token = getStoredToken()

  const { subtotal, shipping, total } = calculateOrderTotals(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  const { order } = await request('/orders', {
    method: 'POST',
    token,
    body: {
      items,
      shippingAddress,
      paymentMethod: orderData?.paymentMethod ?? 'cod',
      subtotal,
      shipping,
      total,
      estimatedDelivery: getEstimatedDeliveryWindow(),
    },
  })

  return order
}

/**
 * Order history for the signed-in account.
 *
 * Takes no user argument on purpose: identity comes from the bearer token, not
 * from something the caller can pass in. Accepting a `user` here would be a
 * trap, because the token is what the server filters on and the two could
 * disagree. Resolves `[]` for a valid session with no orders, and rejects with
 * an `ApiError` when signed out so callers can treat every failure alike.
 */
export async function getMyOrders() {
  const token = getStoredToken()

  if (!token) {
    throw new ApiError('Sign in to view your orders.', {
      status: 401,
      code: 'token_invalid',
    })
  }

  const { orders } = await request('/orders/mine', { method: 'GET', token })

  return Array.isArray(orders) ? orders : []
}
