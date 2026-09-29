'use client'

import { useId } from 'react'
import Link from 'next/link'

import styles from './MegaMenu.module.css'

/**
 * Fallback columns for the rare case where the server-provided navigation has
 * not arrived. The real columns are fetched by `services/navigationService` and
 * passed in as a prop from the root layout, because this is a client component
 * and cannot await during render.
 */
export const MENU_COLUMNS = []

function ColumnLinks({ column, linkClassName, onNavigate }) {
  return (
    <ul className={styles.links}>
      {column.links.map((link) => (
        <li key={link.id}>
          <Link
            href={link.href}
            className={linkClassName}
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function MegaMenu({
  columns = MENU_COLUMNS,
  variant = 'panel',
  isOpen = false,
  onClose,
  id,
}) {
  const generatedId = useId()
  const panelId = id ?? generatedId

  if (columns.length === 0) {
    return null
  }

  if (variant === 'inline') {
    return (
      <div className={styles.inline} id={panelId}>
        {columns.map((column) => (
          <section key={column.id} className={styles.inlineColumn}>
            <h3 className={styles.columnTitle}>
              <Link href={column.href} className={styles.columnLink} onClick={onClose}>
                {column.title}
              </Link>
            </h3>
            <ColumnLinks
              column={column}
              linkClassName={styles.inlineLink}
              onNavigate={onClose}
            />
          </section>
        ))}
      </div>
    )
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className={styles.panel} id={panelId}>
      <div className={styles.panelInner}>
        <ul className={styles.columns}>
          {columns.map((column) => (
            <li key={column.id} className={styles.column}>
              <h3 className={styles.columnTitle}>
                <Link href={column.href} className={styles.columnLink} onClick={onClose}>
                  {column.title}
                </Link>
              </h3>
              <ColumnLinks
                column={column}
                linkClassName={styles.panelLink}
                onNavigate={onClose}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
