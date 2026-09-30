import styles from './LoadingState.module.css'

export default function LoadingState({ label = 'Loading', children = null }) {
  return (
    <div className={styles.loading} role="status" aria-busy="true">
      {children}
      <span className="screenReaderOnly">{label}</span>
    </div>
  )
}
