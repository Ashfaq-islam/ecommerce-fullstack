import styles from './Button.module.css'

const VARIANT_CLASS = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
}

const SIZE_CLASS = {
  md: styles.sizeMd,
  lg: styles.sizeLg,
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className,
  children,
  ...rest
}) {
  const isDisabled = loading || disabled

  return (
    <button
      type={type}
      className={[
        styles.button,
        VARIANT_CLASS[variant] ?? VARIANT_CLASS.primary,
        SIZE_CLASS[size] ?? styles.sizeMd,
        fullWidth ? styles.fullWidth : '',
        loading ? styles.loading : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled}
      aria-busy={loading ? true : undefined}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      {children}
    </button>
  )
}