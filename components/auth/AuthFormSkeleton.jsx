import styles from './AuthForm.module.css'

/**
 * Rendered in place of the sign-in form while the client-only subtree resolves.
 * `.screenReaderOnly` comes from globals.css.
 */
export default function AuthFormSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true">
      <span className="screenReaderOnly">Loading the sign in form</span>

      <div className={styles.skeletonShort} aria-hidden="true" />
      <div className={styles.skeletonShort} aria-hidden="true" />
      <div className={styles.skeletonBlock} aria-hidden="true" />
      <div className={styles.skeletonBlock} aria-hidden="true" />
      <div className={styles.skeletonBlock} aria-hidden="true" />
      <div className={styles.skeletonNote} aria-hidden="true" />
    </div>
  )
}
