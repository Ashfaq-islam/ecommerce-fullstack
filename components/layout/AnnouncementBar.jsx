'use client'

import { useState } from 'react'

import styles from './AnnouncementBar.module.css'

const ANNOUNCEMENTS = [
  {
    id: 'cash-on-delivery',
    text: 'Cash on Delivery in all 64 Districts',
  },
]

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export default function AnnouncementBar({ announcements = ANNOUNCEMENTS }) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed || announcements.length === 0) {
    return null
  }

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <ul className={styles.messages}>
          {announcements.map((announcement) => (
            <li key={announcement.id} className={styles.message}>
              {announcement.text}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className={styles.close}
        onClick={() => setIsDismissed(true)}
        aria-label="Dismiss announcement"
      >
        <CloseIcon />
      </button>
    </div>
  )
}
