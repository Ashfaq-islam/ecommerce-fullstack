'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Button from '@/components/common/Button'
import { useAuth } from '@/hooks/useAuth'
import {
  MIN_PASSWORD_LENGTH,
  PHONE_PLACEHOLDER,
  getPasswordStrength,
  isValidEmail,
  isValidPhone,
} from '@/lib/validation'

import styles from './AuthForm.module.css'

const INITIAL_VALUES = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

function validate(values) {
  const errors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const phone = values.phone.trim()
  const password = values.password

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
  } else if (!isValidPhone(phone)) {
    errors.phone = `Enter a valid phone number, for example ${PHONE_PLACEHOLDER}.`
  }

  if (!password) {
    errors.password = 'Choose a password.'
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Re-enter your password.'
  } else if (values.confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export default function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()

  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [revealed, setRevealed] = useState({ password: false, confirmPassword: false })

  const strength = getPasswordStrength(values.password)

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
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      })
      router.push('/account')
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'We could not create your account.',
      )
      setIsSubmitting(false)
    }
  }

  const fieldClass = (field) =>
    errors[field] ? `${styles.input} ${styles.inputInvalid}` : styles.input

  return (
    <>
      <div className={styles.header}>
        <h2 className={styles.title}>Create your account</h2>
        <p className={styles.subtitle}>Save your details for a faster checkout next time.</p>
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
              aria-describedby={errors.phone ? 'reg-phone-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.phone ? (
              <p className={styles.error} id="reg-phone-error">
                {errors.phone}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-password">
              Password
            </label>
            <div className={styles.passwordRow}>
              <input
                className={fieldClass('password')}
                id="reg-password"
                name="password"
                type={revealed.password ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={values.password}
                onChange={handleChange('password')}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'reg-password-error' : 'password-meter'}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className={styles.reveal}
                onClick={() =>
                  setRevealed((current) => ({ ...current, password: !current.password }))
                }
                disabled={isSubmitting}
              >
                {revealed.password ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password ? (
              <p className={styles.error} id="reg-password-error">
                {errors.password}
              </p>
            ) : null}
            {values.password ? (
              <div className={styles.meter} id="password-meter">
                <span className={styles.meterTrack}>
                  {[0, 1, 2, 3].map((index) => (
                    <span
                      key={index}
                      className={styles.meterSegment}
                      data-filled={index < strength.score || undefined}
                      data-score={strength.score || undefined}
                    />
                  ))}
                </span>
                <span className={styles.meterLabel}>{strength.label}</span>
              </div>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm-password">
              Confirm password
            </label>
            <div className={styles.passwordRow}>
              <input
                className={fieldClass('confirmPassword')}
                id="confirm-password"
                name="confirmPassword"
                type={revealed.confirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={values.confirmPassword}
                onChange={handleChange('confirmPassword')}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className={styles.reveal}
                onClick={() =>
                  setRevealed((current) => ({
                    ...current,
                    confirmPassword: !current.confirmPassword,
                  }))
                }
                disabled={isSubmitting}
              >
                {revealed.confirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className={styles.error} id="confirm-password-error">
                {errors.confirmPassword}
              </p>
            ) : null}
          </div>
        </div>

        {formError ? (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        ) : null}

        <Button type="submit" fullWidth loading={isSubmitting}>
          {isSubmitting ? 'Creating account' : 'Create account'}
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
