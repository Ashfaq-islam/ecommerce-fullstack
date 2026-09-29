'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import Button from '@/components/common/Button'

import StarRating from './StarRating'
import styles from './ReviewForm.module.css'

const TITLE_MIN = 5
const TITLE_MAX = 100
const BODY_MIN = 20
const BODY_MAX = 2000

const SUBMIT_DELAY_MS = 500

const INITIAL_VALUES = { rating: 0, title: '', body: '' }

// Order matters: it is the order the eye should be sent in when a submit fails.
const FIELD_ORDER = ['rating', 'title', 'body']

function validateField(field, values) {
  if (field === 'rating') {
    return values.rating ? null : 'Choose a star rating.'
  }

  const value = values[field].trim()

  if (!value) {
    return field === 'title'
      ? 'Add a short title for your review.'
      : 'Tell other shoppers what you thought.'
  }

  const min = field === 'title' ? TITLE_MIN : BODY_MIN
  const max = field === 'title' ? TITLE_MAX : BODY_MAX
  const noun = field === 'title' ? 'Title' : 'Review'

  if (value.length < min) {
    return `${noun} must be at least ${min} characters.`
  }

  if (value.length > max) {
    return `${noun} must be ${max} characters or fewer.`
  }

  return null
}

function validate(values) {
  const errors = {}

  for (const field of FIELD_ORDER) {
    const error = validateField(field, values)

    if (error) {
      errors[field] = error
    }
  }

  return errors
}

export default function ReviewForm({ productId, isAuthenticated }) {
  const pathname = usePathname()

  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const ratingRef = useRef(null)
  const titleRef = useRef(null)
  const bodyRef = useRef(null)

  if (!isAuthenticated) {
    return (
      <div className={styles.signIn}>
        <p className={styles.signInText}>Login to write a review</p>
        {/* `next` is the page the visitor was on, so signing in returns them
            here instead of the account page. */}
        <Link className={styles.signInLink} href={`/login?next=${encodeURIComponent(pathname)}`}>
          Log in
        </Link>
      </div>
    )
  }

  const focusField = (field) => {
    if (field === 'rating') {
      ratingRef.current?.querySelector('input')?.focus()
    } else if (field === 'title') {
      titleRef.current?.focus()
    } else {
      bodyRef.current?.focus()
    }
  }

  const handleChange = (field) => (event) => {
    const { value } = event.target
    setValues((current) => ({ ...current, [field]: value }))

    // Only a field that is already complaining revalidates as you type, so the
    // form does not shout at someone who has not finished the first word.
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: validateField(field, { ...values, [field]: value }) }))
    }
  }

  const handleBlur = (field) => () => {
    setErrors((current) => ({ ...current, [field]: validateField(field, values) }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const nextErrors = validate(values)
    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field])

    setErrors(nextErrors)
    setIsSubmitted(false)

    if (firstInvalid) {
      focusField(firstInvalid)
      return
    }

    setIsSubmitting(true)

    // Mock submit: stands in for the reviews endpoint until it exists.
    console.log('Review submitted:', {
      productId,
      rating: values.rating,
      title: values.title.trim(),
      body: values.body.trim(),
    })

    await new Promise((resolve) => setTimeout(resolve, SUBMIT_DELAY_MS))

    setValues(INITIAL_VALUES)
    setErrors({})
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const titleLength = values.title.trim().length
  const bodyLength = values.body.trim().length

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h3 className={styles.heading}>Write a review</h3>

      <fieldset className={styles.field}>
        <legend className={styles.label}>Your rating</legend>
        <div ref={ratingRef}>
          <StarRating
            value={values.rating}
            size="lg"
            readOnly={false}
            name="review-rating"
            label="Your rating"
            describedBy={errors.rating ? 'review-rating-error' : null}
            invalid={Boolean(errors.rating)}
            onChange={(rating) => {
              setValues((current) => ({ ...current, rating }))
              setErrors((current) => ({ ...current, rating: null }))
            }}
          />
        </div>
        {errors.rating ? (
          <p className={styles.error} id="review-rating-error">
            {errors.rating}
          </p>
        ) : null}
      </fieldset>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="review-title">
          Title
        </label>
        <input
          className={errors.title ? `${styles.input} ${styles.inputInvalid}` : styles.input}
          id="review-title"
          name="title"
          type="text"
          placeholder="Sums up your experience in a few words"
          value={values.title}
          onChange={handleChange('title')}
          onBlur={handleBlur('title')}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={
            [errors.title ? 'review-title-error' : null, 'review-title-count']
              .filter(Boolean)
              .join(' ') || undefined
          }
          disabled={isSubmitting}
        />
        <div className={styles.foot}>
          {errors.title ? (
            <p className={styles.error} id="review-title-error">
              {errors.title}
            </p>
          ) : null}
          <span
            className={titleLength > TITLE_MAX ? styles.counterOver : styles.counter}
            id="review-title-count"
          >
            {titleLength}/{TITLE_MAX}
          </span>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="review-body">
          Your review
        </label>
        <textarea
          className={errors.body ? `${styles.input} ${styles.inputInvalid}` : styles.input}
          id="review-body"
          name="body"
          rows={5}
          placeholder="What did you like or dislike? How did the size and quality run?"
          value={values.body}
          onChange={handleChange('body')}
          onBlur={handleBlur('body')}
          aria-invalid={Boolean(errors.body)}
          aria-describedby={
            [errors.body ? 'review-body-error' : null, 'review-body-count']
              .filter(Boolean)
              .join(' ') || undefined
          }
          disabled={isSubmitting}
        />
        <div className={styles.foot}>
          {errors.body ? (
            <p className={styles.error} id="review-body-error">
              {errors.body}
            </p>
          ) : null}
          <span
            className={bodyLength > BODY_MAX ? styles.counterOver : styles.counter}
            id="review-body-count"
          >
            {bodyLength}/{BODY_MAX}
          </span>
        </div>
      </div>

      <Button type="submit" loading={isSubmitting}>
        {isSubmitting ? 'Submitting' : 'Submit review'}
      </Button>

      {isSubmitted ? (
        <p className={styles.success} role="status">
          Review submitted! It will appear after approval.
        </p>
      ) : null}
    </form>
  )
}
