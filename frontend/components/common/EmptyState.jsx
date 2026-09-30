import Link from 'next/link'

import styles from './EmptyState.module.css'

export default function EmptyState({ title, description, actionHref, actionLabel }) {
  return (
    <div className={styles.empty} role="status">
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
      {actionHref && actionLabel ? (
        <Link className={styles.action} href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
