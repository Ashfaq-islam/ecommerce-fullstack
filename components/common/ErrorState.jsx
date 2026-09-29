import styles from './ErrorState.module.css'

function AlertIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5" />
      <path d="M12 16.25h.01" />
    </svg>
  )
}

export default function ErrorState({
  title = 'Something went wrong',
  description = null,
  actionLabel = null,
  onRetry = null,
}) {
  return (
    <div className={styles.error} role="alert">
      <span className={styles.icon}>
        <AlertIcon />
      </span>
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
      {actionLabel && onRetry ? (
        <button type="button" className={styles.action} onClick={onRetry}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
