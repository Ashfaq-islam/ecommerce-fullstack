import StarRating from './StarRating'
import styles from './ReviewCard.module.css'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

const absoluteFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function plural(count, unit) {
  return `${count} ${unit}${count === 1 ? '' : 's'} ago`
}

/**
 * "3 days ago" for anything recent, then a real date once "8 months ago" stops
 * being useful to a shopper. Parsed as UTC-to-UTC: the difference between two
 * instants does not depend on the viewer's timezone, so the string is the same
 * on the server and on the client and the card cannot hydrate into a mismatch.
 */
function formatRelativeDate(isoString) {
  const timestamp = Date.parse(isoString)

  if (Number.isNaN(timestamp)) {
    return ''
  }

  const elapsed = Date.now() - timestamp

  if (elapsed < MINUTE) {
    return 'Just now'
  }

  if (elapsed < HOUR) {
    return plural(Math.floor(elapsed / MINUTE), 'minute')
  }

  if (elapsed < DAY) {
    return plural(Math.floor(elapsed / HOUR), 'hour')
  }

  if (elapsed < WEEK) {
    return plural(Math.floor(elapsed / DAY), 'day')
  }

  if (elapsed < MONTH) {
    return plural(Math.floor(elapsed / WEEK), 'week')
  }

  if (elapsed < YEAR) {
    return plural(Math.floor(elapsed / MONTH), 'month')
  }

  return absoluteFormatter.format(new Date(timestamp))
}

function getInitial(userName) {
  const firstWord = String(userName ?? '').trim().split(/\s+/)[0] ?? ''

  return firstWord.charAt(0).toUpperCase()
}

export default function ReviewCard({ review }) {
  if (!review) {
    return null
  }

  const { userName, rating, title, body, createdAt, verifiedPurchase } = review
  const relativeDate = formatRelativeDate(createdAt)

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <span className={styles.avatar} aria-hidden="true">
          {getInitial(userName)}
        </span>

        <div className={styles.identity}>
          <p className={styles.name}>{userName}</p>

          <div className={styles.meta}>
            <StarRating value={rating} size="sm" label={`${rating} out of 5`} />
            {verifiedPurchase ? (
              <span className={styles.verified}>Verified purchase</span>
            ) : null}
          </div>
        </div>

        {relativeDate ? (
          <time className={styles.date} dateTime={createdAt}>
            {relativeDate}
          </time>
        ) : null}
      </div>

      {title ? <h3 className={styles.title}>{title}</h3> : null}
      {body ? <p className={styles.body}>{body}</p> : null}
    </article>
  )
}
