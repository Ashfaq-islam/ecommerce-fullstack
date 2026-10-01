import { PHONE_PLACEHOLDER, isValidPhone } from '@/lib/validation'

export const DEFAULT_PAYMENT_METHOD = 'cod'

export const PAYMENT_METHODS = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay the courier in cash when your parcel arrives.',
    isAvailable: true,
  },
  {
    id: 'online',
    label: 'Online Payment',
    description: 'Card, bKash and Nagad payments are on the way.',
    isAvailable: false,
  },
]

/** Query param the checkout appends when it bounces an empty cart. */
export const EMPTY_CART_NOTICE_PARAM = 'empty-cart'

export const ORDER_STASH_KEY = 'shopstore-last-order'

const REQUIRED_FIELD_MESSAGES = {
  fullName: 'Enter your full name.',
  phone: 'Enter your phone number.',
  address: 'Enter your delivery address.',
  district: 'Select your district.',
  city: 'Enter your city or area.',
}

function toTrimmed(value) {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Returns a field-keyed map of validation messages. An empty object means the
 * form is safe to submit.
 *
 * `districts` is the list the form loaded, passed in rather than imported: the
 * district list now travels through the apiClient, so validation cannot read it
 * synchronously. When the list is unavailable the district check degrades to
 * "must not be empty" and the server is left to reject an unknown district.
 */
export function validateCheckoutForm(values = {}, { districts = [] } = {}) {
  const errors = {}
  const name = toTrimmed(values.fullName)
  const phone = toTrimmed(values.phone)
  const address = toTrimmed(values.address)
  const district = toTrimmed(values.district)
  const city = toTrimmed(values.city)

  if (!name) {
    errors.fullName = REQUIRED_FIELD_MESSAGES.fullName
  } else if (name.length < 2) {
    errors.fullName = 'Enter at least 2 characters.'
  }

  if (!phone) {
    errors.phone = REQUIRED_FIELD_MESSAGES.phone
  } else if (!isValidPhone(phone)) {
    errors.phone = `Enter a valid phone number, for example ${PHONE_PLACEHOLDER}.`
  }

  if (!address) {
    errors.address = REQUIRED_FIELD_MESSAGES.address
  } else if (address.length < 8) {
    errors.address = 'Enter a more complete address, including house or flat details.'
  }

  if (!district) {
    errors.district = REQUIRED_FIELD_MESSAGES.district
  } else if (Array.isArray(districts) && districts.length > 0 && !districts.includes(district)) {
    errors.district = 'Select a district from the list.'
  }

  if (!city) {
    errors.city = REQUIRED_FIELD_MESSAGES.city
  }

  return errors
}

export function hasErrors(errors) {
  return Boolean(errors) && Object.keys(errors).length > 0
}

/** Field order drives both the layout and the "focus the first problem" pass. */
export const CHECKOUT_FIELDS = ['fullName', 'phone', 'address', 'district', 'city']

export function getFirstInvalidField(errors) {
  return CHECKOUT_FIELDS.find((field) => Boolean(errors?.[field])) ?? null
}

export function getPaymentMethodLabel(id) {
  return PAYMENT_METHODS.find((method) => method.id === id)?.label ?? id
}

/**
 * The placed order is parked in sessionStorage so the confirmation screen can
 * render it. The cart is cleared on submit, so the order cannot be rebuilt from
 * the store afterwards.
 */
export function stashOrder(order) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.setItem(ORDER_STASH_KEY, JSON.stringify(order))
  } catch {
    // A full or blocked sessionStorage should not block checkout itself.
  }
}

let stashedOrderCache = { raw: undefined, value: null }

/**
 * Snapshot getter for `useSyncExternalStore`. The raw string is compared before
 * re-parsing so the returned reference stays stable, otherwise React would
 * detect a new snapshot on every render and loop.
 */
export function getStashedOrderSnapshot() {
  if (typeof window === 'undefined') {
    return null
  }

  let raw = null

  try {
    raw = window.sessionStorage.getItem(ORDER_STASH_KEY) ?? null
  } catch {
    return null
  }

  if (raw === stashedOrderCache.raw) {
    return stashedOrderCache.value
  }

  let value = null

  try {
    const parsed = raw ? JSON.parse(raw) : null
    value = parsed && typeof parsed === 'object' && parsed.orderNumber ? parsed : null
  } catch {
    value = null
  }

  stashedOrderCache = { raw, value }
  return value
}

/**
 * The stash is written before this screen mounts and never changes while it is
 * open, so there is nothing to subscribe to.
 */
export function subscribeToStashedOrder() {
  return () => {}
}
