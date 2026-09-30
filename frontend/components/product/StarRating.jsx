import styles from './StarRating.module.css'

const MAX_RATING = 5

const SIZE_CLASS = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
}

/**
 * A five-pointed star as a single path, so every star in the row is the same
 * glyph and the base and fill layers always line up. `currentColor` keeps the
 * colour in CSS rather than in a prop.
 */
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 2.6l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.42l-5.8 3.04 1.11-6.46-4.7-4.58 6.49-.94L12 2.6z" />
    </svg>
  )
}

function clamp(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }

  return Math.min(Math.max(value, 0), MAX_RATING)
}

/**
 * `fill` is the percentage of the star that should be painted: 100 for a full
 * star, 50 for a half star. Fractional averages are drawn with a filled copy of
 * the row clipped to that percentage, rather than rounded to a whole star, so
 * 4.2 is not shown as four.
 */
function Star({ fill }) {
  return (
    <span className={styles.star}>
      <span className={styles.base}>
        <StarIcon />
      </span>
      <span className={styles.fill} style={{ width: `${fill}%` }}>
        <StarIcon />
      </span>
    </span>
  )
}

function fillFor(rating, index) {
  return Math.max(0, Math.min(1, rating - index)) * 100
}

/**
 * Star rating display, and — when `readOnly` is false — a radio group that lets
 * a rating be picked. Interactive mode uses real radio inputs rather than click
 * handlers on the glyphs so arrow keys, form participation and screen readers
 * behave the way the platform expects.
 */
export default function StarRating({
  value = 0,
  size = 'md',
  readOnly = true,
  showValue = false,
  label = null,
  name = 'rating',
  onChange = null,
  describedBy = null,
  invalid = false,
}) {
  const rating = clamp(value)
  const sizeClass = SIZE_CLASS[size] ?? SIZE_CLASS.md
  const className = [styles.rating, sizeClass].filter(Boolean).join(' ')

  if (!readOnly) {
    const selected = Math.round(rating)

    return (
      <span
        className={className}
        role="radiogroup"
        aria-label={label ?? 'Rating'}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy ?? undefined}
      >
        {Array.from({ length: MAX_RATING }, (_, index) => {
          const star = index + 1

          return (
            <label className={styles.option} key={star}>
              <input
                className={styles.input}
                type="radio"
                name={name}
                value={star}
                checked={selected === star}
                onChange={() => onChange?.(star)}
              />
              <Star fill={selected >= star ? 100 : 0} />
            </label>
          )
        })}
      </span>
    )
  }

  return (
    <span
      className={className}
      role="img"
      aria-label={label ?? `Rated ${rating} out of ${MAX_RATING}`}
    >
      <span className={styles.stars} aria-hidden="true">
        {Array.from({ length: MAX_RATING }, (_, index) => (
          <Star fill={fillFor(rating, index)} key={index} />
        ))}
      </span>
      {showValue ? (
        <span className={styles.value} aria-hidden="true">
          {rating.toFixed(1)}
        </span>
      ) : null}
    </span>
  )
}

export { MAX_RATING }
