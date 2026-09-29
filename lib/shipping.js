export const DELIVERY_FEE = 80
export const FREE_DELIVERY_THRESHOLD = 3000

// Friday and Saturday are the weekend in Bangladesh.
const WEEKEND_DAYS = new Set([5, 6])
const DELIVERY_WINDOW_BUSINESS_DAYS = { min: 2, max: 4 }

function toSafeSubtotal(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

export function calculateOrderTotals(subtotal) {
  const safeSubtotal = toSafeSubtotal(subtotal)
  const shipping =
    safeSubtotal === 0 || safeSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE

  return {
    subtotal: safeSubtotal,
    shipping,
    total: safeSubtotal + shipping,
  }
}

export function getRemainingForFreeDelivery(subtotal) {
  return Math.max(0, FREE_DELIVERY_THRESHOLD - toSafeSubtotal(subtotal))
}

function addBusinessDays(from, days) {
  const cursor = new Date(from.getTime())
  let added = 0

  while (added < days) {
    cursor.setDate(cursor.getDate() + 1)
    if (!WEEKEND_DAYS.has(cursor.getDay())) {
      added += 1
    }
  }

  return cursor
}

/**
 * Delivery window labels for the confirmation screen, skipping the Friday and
 * Saturday weekend. Resolved once when the order is placed so the dates cannot
 * shift between render and display.
 */
export function getEstimatedDeliveryWindow(fromDate = new Date()) {
  const from = fromDate instanceof Date && !Number.isNaN(fromDate.getTime()) ? fromDate : new Date()
  const start = addBusinessDays(from, DELIVERY_WINDOW_BUSINESS_DAYS.min)
  const end = addBusinessDays(from, DELIVERY_WINDOW_BUSINESS_DAYS.max)

  const sameMonth = start.getMonth() === end.getMonth()
  const startFormatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
  })
  const endFormatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    label: `${startFormatter.format(start)} - ${endFormatter.format(end)}`,
  }
}
