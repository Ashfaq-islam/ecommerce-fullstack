import styles from './AuthCard.module.css'

/**
 * Centred card shell shared by the sign-in and registration screens. The
 * account page is deliberately not wrapped in this: it needs the full width for
 * its order history, and a route group layout cannot be opted out of.
 */
export default function AuthCard({ children }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>{children}</div>
    </div>
  )
}
