'use client'

import { useEffect, useState } from 'react'

import styles from './ScrollToTop.module.css'

const SCROLL_THRESHOLD = 400

function ArrowUpIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 20V4" />
      <path d="m5 11 7-7 7 7" />
    </svg>
  )
}

export default function ScrollToTop({ threshold = SCROLL_THRESHOLD }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  if (!isVisible) {
    return null
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={scrollToTop}
      aria-label="Scroll back to top"
    >
      <ArrowUpIcon />
    </button>
  )
}
