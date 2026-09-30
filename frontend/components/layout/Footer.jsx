'use client'

import { useId, useState } from 'react'
import Link from 'next/link'

import styles from './Footer.module.css'

const BRAND = {
  name: 'ShopStore',
  href: '/',
}

const ABOUT = {
  heading: 'About',
  description:
    'An online marketplace for everyday essentials, delivered nationwide with cash on delivery available in all 64 districts.',
}

// Every href below has to resolve to something the app actually serves. The
// catalogue has no `/categories`, `/help`, `/shipping`, `/returns` or `/contact`
// page, and `?sort=` / `?filter=` were never filter params, so those links
// silently 404'd or fell through to the unfiltered shop.
//
// The informational pages (help, shipping, returns, contact) have no
// destination yet, so they are omitted rather than pointed somewhere unrelated.
// Customer service keeps the destinations that genuinely exist.
const QUICK_LINKS = [
  { id: 'shop', label: 'Shop All', href: '/shop' },
  { id: 'new-arrivals', label: 'New Arrivals', href: '/shop?badge=New' },
  { id: 'best-sellers', label: 'Best Sellers', href: '/shop?badge=Best+Seller' },
  { id: 'offers', label: 'Offers', href: '/shop?badge=Sale' },
]

const CUSTOMER_SERVICE = [
  { id: 'account', label: 'My Account', href: '/account' },
  { id: 'cart', label: 'Cart', href: '/cart' },
  { id: 'shop', label: 'Continue Shopping', href: '/shop' },
]

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

function FooterColumn({ heading, children }) {
  return (
    <section className={styles.column}>
      <h2 className={styles.columnHeading}>{heading}</h2>
      {children}
    </section>
  )
}

function FooterLinks({ links }) {
  return (
    <ul className={styles.linkList}>
      {links.map((link) => (
        <li key={link.id}>
          <Link className={styles.link} href={link.href}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function Footer({
  brand = BRAND,
  about = ABOUT,
  quickLinks = QUICK_LINKS,
  customerService = CUSTOMER_SERVICE,
}) {
  const emailFieldId = useId()
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setIsSubscribed(true)
    setEmail('')
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <FooterColumn heading={about.heading}>
          <p className={styles.aboutText}>{about.description}</p>
          <Link className={styles.aboutLink} href={brand.href}>
            Back to top of store
          </Link>
        </FooterColumn>

        <FooterColumn heading="Quick Links">
          <FooterLinks links={quickLinks} />
        </FooterColumn>

        <FooterColumn heading="Customer Service">
          <FooterLinks links={customerService} />
        </FooterColumn>

        <FooterColumn heading="Newsletter">
          <p className={styles.newsletterText}>
            Sign up for early access to new arrivals and member-only offers.
          </p>

          {isSubscribed ? (
            <p className={styles.formStatus} role="status">
              Thanks for subscribing. Watch your inbox for our next drop.
            </p>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.label} htmlFor={emailFieldId}>
                Email address
              </label>
              <div className={styles.formRow}>
                <input
                  id={emailFieldId}
                  className={styles.input}
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                <button type="submit" className={styles.submit}>
                  <span className={styles.submitText}>Subscribe</span>
                  <ArrowIcon />
                </button>
              </div>
            </form>
          )}
        </FooterColumn>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <p className={styles.legalNote}>
            Cash on Delivery available nationwide. Prices include all applicable
            taxes.
          </p>
        </div>
      </div>
    </footer>
  )
}
