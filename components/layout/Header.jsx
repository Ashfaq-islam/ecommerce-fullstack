'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import CartDrawer from '@/components/cart/CartDrawer'
import { useCart } from '@/hooks/useCart'
import { useUIStore } from '@/store/uiStore'

import MegaMenu from './MegaMenu'
import styles from './Header.module.css'

const BRAND = {
  name: 'ShopStore',
  href: '/',
}

const NAV_LINKS = [
  { id: 'shop', label: 'Shop', href: '/shop' },
  // The mega menu is built from the catalogue by the navigation service, so this
  // entry points at the one listing route that exists rather than a
  // `/categories` page that was never created.
  { id: 'categories', label: 'Categories', href: '/shop', hasMegaMenu: true },
]

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function AccountIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.4 11.4a1.5 1.5 0 0 0 1.5 1.2h8.3a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function Header({ navColumns = [] }) {
  const pathname = usePathname()
  const { itemCount } = useCart()
  const {
    cartDrawerOpen,
    mobileNavOpen,
    megaMenuOpen,
    openCartDrawer,
    closeCartDrawer,
    openMobileNav,
    closeMobileNav,
    toggleMobileNav,
    openMegaMenu,
    closeMegaMenu,
    toggleMegaMenu,
  } = useUIStore()
  const drawerCloseRef = useRef(null)
  const menuToggleRef = useRef(null)
  const cartButtonRef = useRef(null)

  const closeAll = () => {
    closeMegaMenu()
    closeMobileNav()
    closeCartDrawer()
  }

  useEffect(() => {
    if (!mobileNavOpen) {
      return
    }

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    drawerCloseRef.current?.focus()

    return () => {
      body.style.overflow = previousOverflow
    }
  }, [mobileNavOpen])

  useEffect(() => {
    if (!mobileNavOpen && !megaMenuOpen && !cartDrawerOpen) {
      return
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') {
        return
      }

      // The cart drawer owns its own trigger, so return focus to the cart
      // button rather than the navigation toggle.
      if (cartDrawerOpen) {
        closeCartDrawer()
        cartButtonRef.current?.focus()
        return
      }

      closeMegaMenu()
      closeMobileNav()
      menuToggleRef.current?.focus()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileNavOpen, megaMenuOpen, cartDrawerOpen, closeCartDrawer, closeMegaMenu, closeMobileNav])

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`)

  const handleItemBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      closeMegaMenu()
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          type="button"
          ref={menuToggleRef}
          className={`${styles.iconButton} ${styles.menuToggle}`}
          onClick={toggleMobileNav}
          aria-expanded={mobileNavOpen}
          aria-label="Open navigation menu"
        >
          <MenuIcon />
        </button>

        <Link href={BRAND.href} className={styles.logo} onClick={closeAll}>
          <span className={styles.logoMark}>{BRAND.name.slice(0, 1)}</span>
          <span className={styles.logoText}>{BRAND.name}</span>
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <ul className={styles.navList}>
            {NAV_LINKS.map((item) => {
              const isMenuOpen = item.hasMegaMenu && megaMenuOpen

              return (
                <li
                  key={item.id}
                  className={styles.navItem}
                  onMouseEnter={item.hasMegaMenu ? openMegaMenu : undefined}
                  onMouseLeave={item.hasMegaMenu ? closeMegaMenu : undefined}
                  onBlur={handleItemBlur}
                >
                  <span className={styles.navItemInner}>
                    <Link
                      href={item.href}
                      className={styles.navLink}
                      data-active={isActive(item.href) || undefined}
                      onClick={closeAll}
                    >
                      {item.label}
                    </Link>
                    {item.hasMegaMenu ? (
                      <button
                        type="button"
                        className={styles.navCaret}
                        onClick={toggleMegaMenu}
                        aria-expanded={isMenuOpen}
                        aria-controls={`${item.id}-mega-panel`}
                        aria-label={`${item.label} submenu`}
                      >
                        <ChevronIcon />
                      </button>
                    ) : null}
                  </span>

                  {item.hasMegaMenu ? (
                    <MegaMenu
                      id={`${item.id}-mega-panel`}
                      variant="panel"
                      isOpen={isMenuOpen}
                      onClose={closeAll}
                      columns={navColumns}
                    />
                  ) : null}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className={styles.actions}>
          <button type="button" className={styles.iconButton} aria-label="Search">
            <SearchIcon />
          </button>
          <Link href="/account" className={styles.iconButton} aria-label="My account">
            <AccountIcon />
          </Link>
          <button
            type="button"
            ref={cartButtonRef}
            className={styles.cartButton}
            onClick={openCartDrawer}
            aria-expanded={cartDrawerOpen}
            aria-haspopup="dialog"
            aria-label={`Open cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
          >
            <CartIcon />
            {itemCount > 0 ? (
              <span className={styles.cartBadge} aria-hidden="true">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {mobileNavOpen ? (
        <>
          <div className={styles.backdrop} onClick={closeAll} />
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <span className={styles.drawerTitle}>Menu</span>
              <button
                type="button"
                ref={drawerCloseRef}
                className={styles.iconButton}
                onClick={closeAll}
                aria-label="Close navigation menu"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className={styles.drawerNav} aria-label="Mobile">
              <ul className={styles.drawerList}>
                {NAV_LINKS.map((item) => (
                  <li key={item.id} className={styles.drawerItem}>
                    <Link
                      href={item.href}
                      className={styles.drawerLink}
                      data-active={isActive(item.href) || undefined}
                      onClick={closeAll}
                    >
                      {item.label}
                    </Link>
                    {item.hasMegaMenu ? (
                      <MegaMenu variant="inline" onClose={closeAll} columns={navColumns} />
                    ) : null}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </>
      ) : null}

      <CartDrawer isOpen={cartDrawerOpen} onClose={closeCartDrawer} />
    </header>
  )
}
