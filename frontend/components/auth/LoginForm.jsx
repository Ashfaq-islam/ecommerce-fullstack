'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import Button from '@/components/common/Button'
import { getDemoCredentials } from '@/services/authService'
import { useAuth } from '@/hooks/useAuth'
import { getSafeRedirectPath, isValidEmail } from '@/lib/validation'

import styles from './AuthForm.module.css'

const INITIAL_VALUES = { email: '', password: '' }

function validate(values) {
  const errors = {}
  const email = values.email.trim()
  const password = values.password

  if (!email) {
    errors.email = 'Enter your email address.'
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Enter your password.'
  }

  return errors
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  // Loaded through the transport, so the hint disappears in DCMS mode when no
  // demo account is published rather than showing mock credentials.
  const [demo, setDemo] = useState(null)

  // Only same-origin paths are honoured so `?next=` cannot be turned into an
  // open redirect to another site.
  const nextPath = getSafeRedirectPath(searchParams?.get('next'), '/account')

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
      await login(values.email.trim(), values.password)
      router.push(nextPath)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'We could not sign you in.')
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    getDemoCredentials().then((credentials) => {
      if (!cancelled && credentials.email) {
        setDemo(credentials)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const fillDemo = () => {
    if (demo) {
      setValues({ email: demo.email, password: demo.password })
    }

    setErrors({})
    setFormError(null)
  }

  return (
    <>
      <div className={styles.header}>
        <h2 className={styles.title}>Welcome back</h2>
        <p className={styles.subtitle}>Sign in to track orders and check out faster.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              className={errors.email ? `${styles.input} ${styles.inputInvalid}` : styles.input}
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange('email')}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isSubmitting}
            />
            {errors.email ? (
              <p className={styles.error} id="email-error">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <div className={styles.passwordRow}>
              <input
                className={
                  errors.password ? `${styles.input} ${styles.inputInvalid}` : styles.input
                }
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                value={values.password}
                onChange={handleChange('password')}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className={styles.reveal}
                onClick={() => setShowPassword((current) => !current)}
                disabled={isSubmitting}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password ? (
              <p className={styles.error} id="password-error">
                {errors.password}
              </p>
            ) : null}
          </div>
        </div>

        <div className={styles.row}>
          <Link className={styles.link} href="/forgot-password">
            Forgot password?
          </Link>
        </div>

        {formError ? (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        ) : null}

        <Button type="submit" fullWidth loading={isSubmitting}>
          {isSubmitting ? 'Signing in' : 'Sign in'}
        </Button>

        {demo ? (
          <div className={styles.demo}>
            <span>Demo account for local testing</span>
            <span className={styles.demoCode}>
              {demo.email} / {demo.password}
            </span>
            <button
              type="button"
              className={styles.link}
              onClick={fillDemo}
              disabled={isSubmitting}
            >
              Fill demo credentials
            </button>
          </div>
        ) : null}

        <p className={styles.footer}>
          New to ShopStore?{' '}
          <Link className={styles.footerLink} href="/register">
            Create an account
          </Link>
        </p>
      </form>
    </>
  )
}
