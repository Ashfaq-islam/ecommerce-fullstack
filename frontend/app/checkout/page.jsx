import CheckoutForm from '@/components/checkout/CheckoutForm'

import styles from './page.module.css'

export const metadata = {
  title: 'Checkout | ShopStore',
  description: 'Confirm your delivery address and place your ShopStore order with cash on delivery.',
}

export default function CheckoutPage() {
  return (
    <section className="section">
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.subtitle}>
            Cash on delivery is available in all 64 districts. No advance payment needed.
          </p>
        </header>

        <CheckoutForm />
      </div>
    </section>
  )
}
