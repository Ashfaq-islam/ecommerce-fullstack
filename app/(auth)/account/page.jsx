import AccountPanel from '@/components/auth/AccountPanel'

import styles from './page.module.css'

export const metadata = {
  title: 'My Account | ShopStore',
  description: 'View your ShopStore profile and order history.',
}

export default function AccountPage() {
  return (
    <section className="section">
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>My Account</h1>
          <p className={styles.subtitle}>Your profile and recent orders in one place.</p>
        </header>

        <AccountPanel />
      </div>
    </section>
  )
}
