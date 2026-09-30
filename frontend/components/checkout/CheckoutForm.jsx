'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import Button from '@/components/common/Button'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/format'
import {
  DEFAULT_PAYMENT_METHOD,
  EMPTY_CART_NOTICE_PARAM,
  PAYMENT_METHODS,
  getFirstInvalidField,
  hasErrors,
  stashOrder,
  validateCheckoutForm,
} from '@/lib/order'
import { createOrder } from '@/services/orderService'
import { calculateOrderTotals, getRemainingForFreeDelivery } from '@/lib/shipping'
import { PHONE_PLACEHOLDER } from '@/lib/validation'
import { getDistricts } from '@/services/shippingService'

import styles from './CheckoutForm.module.css'

const INITIAL_VALUES = {
  fullName: '',
  phone: '',
  address: '',
  district: '',
  city: '',
}

export default function CheckoutForm() {
  const router = useRouter()
  const { items, total, hasHydrated, clearCart } = useCart()

  const [values, setValues] = useState(INITIAL_VALUES)
  const [districts, setDistricts] = useState([])
  const [districtsError, setDistrictsError] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_METHOD)

  // The district list now comes through the same transport as the catalogue, so
  // it loads asynchronously. The select stays disabled until it resolves.
  useEffect(() => {
    let cancelled = false

    getDistricts().then((list) => {
      if (cancelled) {
        return
      }

      setDistricts(list)
      setDistrictsError(list.length === 0)
    })

    return () => {
      cancelled = true
    }
  }, [])
  const [status, setStatus] = useState('idle')
  const [submitError, setSubmitError] = useState(null)

  const fullNameRef = useRef(null)
  const phoneRef = useRef(null)
  const addressRef = useRef(null)
  const districtRef = useRef(null)
  const cityRef = useRef(null)

  // Set once the order is accepted so clearing the cart does not look like the
  // cart was emptied by the customer and bounce them back to the shop.
  const hasPlacedOrder = useRef(false)
  const isSubmitting = status === 'submitting'

  const { shipping, total: orderTotal } = calculateOrderTotals(total)
  const remainingForFreeDelivery = getRemainingForFreeDelivery(total)

  useEffect(() => {
    if (!hasHydrated || hasPlacedOrder.current) {
      return
    }

    if (items.length === 0) {
      router.replace(`/shop?message=${EMPTY_CART_NOTICE_PARAM}`)
    }
  }, [hasHydrated, items.length, router])

  const handleChange = (field) => (event) => {
    const { value } = event.target
    setValues((current) => ({ ...current, [field]: value }))

    if (touched[field] || errors[field]) {
      setErrors(validateCheckoutForm({ ...values, [field]: value }, { districts }))
    }
  }

  const handleBlur = (field) => () => {
    setTouched((current) => ({ ...current, [field]: true }))
    setErrors(validateCheckoutForm(values, { districts }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    if (items.length === 0) {
      setSubmitError('Your cart is empty. Add an item before placing an order.')
      return
    }

    const nextErrors = validateCheckoutForm(values, { districts })

    setTouched({ fullName: true, phone: true, address: true, district: true, city: true })
    setErrors(nextErrors)

    if (hasErrors(nextErrors)) {
      const fieldRefs = {
        fullName: fullNameRef,
        phone: phoneRef,
        address: addressRef,
        district: districtRef,
        city: cityRef,
      }
      const firstInvalid = getFirstInvalidField(nextErrors)
      fieldRefs[firstInvalid]?.current?.focus()
      return
    }

    setStatus('submitting')
    setSubmitError(null)

    try {
      const order = await createOrder({
        items,
        shippingAddress: values,
        paymentMethod,
      })

      stashOrder(order)
      hasPlacedOrder.current = true
      clearCart()
      router.push('/checkout/success')
    } catch (error) {
      setStatus('idle')
      setSubmitError(
        error instanceof Error && error.message
          ? error.message
          : 'We could not place your order. Please try again.',
      )
    }
  }

  if (!hasHydrated) {
    return (
      <div className={styles.skeleton} aria-busy="true">
        <span className="screenReaderOnly">Loading checkout</span>
      </div>
    )
  }

  const fieldClass = (field) =>
    errors[field] && touched[field] ? `${styles.input} ${styles.inputInvalid}` : styles.input

  return (
    <div className={styles.layout}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <section className={styles.section} aria-labelledby="shipping-heading">
          <h2 className={styles.sectionTitle} id="shipping-heading">
            Shipping Address
          </h2>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="fullName">
                Full name
              </label>
              <input
                className={fieldClass('fullName')}
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="e.g. Ashfaq Sarkar"
                value={values.fullName}
                onChange={handleChange('fullName')}
                onBlur={handleBlur('fullName')}
                ref={fullNameRef}
                aria-invalid={Boolean(errors.fullName && touched.fullName)}
                aria-describedby={errors.fullName && touched.fullName ? 'fullName-error' : undefined}
                disabled={isSubmitting}
              />
              {errors.fullName && touched.fullName ? (
                <p className={styles.error} id="fullName-error">
                  {errors.fullName}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="phone">
                Phone number
              </label>
              <input
                className={fieldClass('phone')}
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder={PHONE_PLACEHOLDER}
                value={values.phone}
                onChange={handleChange('phone')}
                onBlur={handleBlur('phone')}
                ref={phoneRef}
                aria-invalid={Boolean(errors.phone && touched.phone)}
                aria-describedby={errors.phone && touched.phone ? 'phone-error' : 'phone-hint'}
                disabled={isSubmitting}
              />
              {errors.phone && touched.phone ? (
                <p className={styles.error} id="phone-error">
                  {errors.phone}
                </p>
              ) : (
                <p className={styles.hint} id="phone-hint">
                  We will call this number to confirm delivery.
                </p>
              )}
            </div>

            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label className={styles.label} htmlFor="address">
                Address
              </label>
              <textarea
                className={`${fieldClass('address')} ${styles.textarea}`}
                id="address"
                name="address"
                rows={3}
                autoComplete="street-address"
                placeholder="House, road, area"
                value={values.address}
                onChange={handleChange('address')}
                onBlur={handleBlur('address')}
                ref={addressRef}
                aria-invalid={Boolean(errors.address && touched.address)}
                aria-describedby={errors.address && touched.address ? 'address-error' : undefined}
                disabled={isSubmitting}
              />
              {errors.address && touched.address ? (
                <p className={styles.error} id="address-error">
                  {errors.address}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="district">
                District
              </label>
              <select
                className={fieldClass('district')}
                id="district"
                name="district"
                autoComplete="address-level1"
                value={values.district}
                onChange={handleChange('district')}
                onBlur={handleBlur('district')}
                ref={districtRef}
                aria-invalid={Boolean(errors.district && touched.district)}
                aria-describedby={
                  errors.district && touched.district ? 'district-error' : undefined
                }
                disabled={isSubmitting || districts.length === 0}
              >
                <option value="">
                  {districtsError
                    ? 'Districts unavailable'
                    : districts.length === 0
                      ? 'Loading districts'
                      : 'Select district'}
                </option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.district && touched.district ? (
                <p className={styles.error} id="district-error">
                  {errors.district}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="city">
                City / area
              </label>
              <input
                className={fieldClass('city')}
                id="city"
                name="city"
                type="text"
                autoComplete="address-level2"
                placeholder="e.g. Dhanmondi"
                value={values.city}
                onChange={handleChange('city')}
                onBlur={handleBlur('city')}
                ref={cityRef}
                aria-invalid={Boolean(errors.city && touched.city)}
                aria-describedby={errors.city && touched.city ? 'city-error' : undefined}
                disabled={isSubmitting}
              />
              {errors.city && touched.city ? (
                <p className={styles.error} id="city-error">
                  {errors.city}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="payment-heading">
          <h2 className={styles.sectionTitle} id="payment-heading">
            Payment Method
          </h2>

          <div className={styles.methods} role="radiogroup" aria-labelledby="payment-heading">
            {PAYMENT_METHODS.map((method) => {
              const inputId = `payment-${method.id}`
              const isSelected = paymentMethod === method.id

              return (
                <label
                  key={method.id}
                  className={styles.method}
                  data-selected={isSelected || undefined}
                  data-unavailable={!method.isAvailable || undefined}
                >
                  <input
                    className={styles.methodInput}
                    type="radio"
                    id={inputId}
                    name="paymentMethod"
                    value={method.id}
                    checked={isSelected}
                    onChange={() => setPaymentMethod(method.id)}
                    disabled={!method.isAvailable || isSubmitting}
                  />
                  <span className={styles.methodBody}>
                    <span className={styles.methodLabel}>
                      {method.label}
                      {!method.isAvailable ? (
                        <span className={styles.badge}>Coming soon</span>
                      ) : null}
                    </span>
                    <span className={styles.methodDescription}>{method.description}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </section>

        {submitError ? (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        ) : null}

        <Button type="submit" size="lg" loading={isSubmitting}>
          {isSubmitting ? 'Placing order' : 'Place order'}
        </Button>

        <p className={styles.terms}>
          By placing this order you confirm the delivery details above are correct.
        </p>
      </form>

      <aside className={styles.summary} aria-label="Order summary">
        <h2 className={styles.summaryTitle}>Order Summary</h2>

        <ul className={styles.summaryItems}>
          {items.map((item) => (
            <li key={`${item.productId}-${item.variantId ?? 'base'}`} className={styles.summaryItem}>
              <span className={styles.summaryThumb}>
                <Image
                  className={styles.summaryImage}
                  src={item.image}
                  alt=""
                  fill
                  sizes="48px"
                />
                <span className={styles.summaryQty} aria-hidden="true">
                  {item.quantity}
                </span>
              </span>
              <span className={styles.summaryItemBody}>
                <span className={styles.summaryItemName}>{item.name}</span>
                <span className={styles.summaryItemMeta}>
                  {[item.size, item.color].filter(Boolean).join(' · ') || 'Standard'}
                </span>
              </span>
              <span className={styles.summaryItemPrice}>
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className={styles.summaryRows}>
          <div className={styles.summaryRow}>
            <dt>Subtotal</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Shipping</dt>
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
      </aside>
    </div>
  )
}
