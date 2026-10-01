'use client'

import { useState } from 'react'
import Link from 'next/link'

import Button from '@/components/common/Button'
import { createSignupRequest } from '@/services/authService'
import { PHONE_PLACEHOLDER, isValidEmail } from '@/lib/validation'

import styles from './AuthForm.module.css'

// Self-registration is disabled on the DCMS: this form files a signup request
// and an admin creates the account. Nothing is ever sent to the shopper's
// browser here, so no password field exists.
const INITIAL_VALUES = {
  name: '',
  email: '',
  phone: '',
  address: '',
}

// Local to this form on purpose. `isValidPhone` only accepts the bare national
// format because checkout already depends on it, and widening that would
// change validation on a page this task does not touch. Here we also allow the
// `+880` prefix shoppers commonly type.
const PHONE_INPUT_PATTERN = /^(?:\+?88)?01\d{9}$/

function isValidPhoneInput(value) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return PHONE_INPUT_PATTERN.test(trimmed.replace(/[\s-]/g, ''))
}

function validate(values) {
  const errors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const phone = values.phone.trim()

  if (!name) {
    errors.name = 'Enter your full name.'
  } else if (name.length < 2) {
    errors.name = 'Enter at least 2 characters.'
  }

  if (!email) {
    errors.email = 'Enter your email address.'
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!phone) {
    errors.phone = 'Enter your phone number.'
  } else if (!isValidPhoneInput(phone)) {
    errors.phone = `Enter a valid phone number, for example ${PHONE_PLACEHOLDER}.`
  }

  return errors
}

export default function RegisterForm() {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRequested, setIsRequested] = useState(false)

  const handleChange = (field) => (event) => {
    const { value } = event.target
    setValues((current) => ({ ...current, [field]: value }))

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: validate({ ...values, [field]: value })[field] }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const nextErrors = validate(values)
    setErrors(nextErrors)
    setFormError(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await createSignupRequest({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
      })
      setIsRequested(true)
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'We could not process your request. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldClass = (field) =>
    errors[field] ? `${styles.input} ${styles.inputInvalid}` : styles.input

  if (isRequested) {
    return (
      <>
        <div className={styles.header}>
          <h2 className={styles.title}>Request received</h2>
          <p className={styles.subtitle}>
            We&apos;ll review your details and get in touch.
          </p>
        </div>

        <p className={styles.success} role="status">
          Request received. We&apos;ll contact you with login details shortly.
        </p>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link className={styles.footerLink} href="/login">
            Sign in
          </Link>
        </p>
      </>
    )
  }

  return (
    <>
      <div className={styles.header}>
        <h2 className={styles.title}>Request an account</h2>
        <p className={styles.subtitle}>
          Tell us how to reach you and we&apos;ll set up your account.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Full name
            </label>
            <input
              className={fieldClass('name')}
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Ashfaq Sarkar"
              value={values.name}
              onChange={handleChange('name')}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.name ? (
              <p className={styles.error} id="name-error">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-email">
              Email
            </label>
            <input
              className={fieldClass('email')}
              id="reg-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange('email')}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'reg-email-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.email ? (
              <p className={styles.error} id="reg-email-error">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-phone">
              Phone number
            </label>
            <input
              className={fieldClass('phone')}
              id="reg-phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder={PHONE_PLACEHOLDER}
              value={values.phone}
              onChange={handleChange('phone')}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'reg-phone-error' : 'reg-phone-hint'}
              disabled={isSubmitting}
            />
            {errors.phone ? (
              <p className={styles.error} id="reg-phone-error">
                {errors.phone}
              </p>
            ) : (
              <p className={styles.hint} id="reg-phone-hint">
                11 digits, with or without the +880 prefix.
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-address">
              Address <span className={styles.hint}>(optional)</span>
            </label>
            <textarea
              className={styles.input}
              id="reg-address"
              name="address"
              rows={3}
              autoComplete="street-address"
              placeholder="e.g. House 12, Road 5, Dhaka 1207"
              value={values.address}
              onChange={handleChange('address')}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {formError ? (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        ) : null}

        <Button type="submit" fullWidth loading={isSubmitting}>
          {isSubmitting ? 'Sending request' : 'Request account'}
        </Button>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link className={styles.footerLink} href="/login">
            Sign in
          </Link>
        </p>
      </form>
    </>
  )
}