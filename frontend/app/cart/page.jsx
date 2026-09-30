import CartView from '@/components/cart/CartView'

import styles from './page.module.css'

export const metadata = {
  title: 'Your Cart | ShopStore',
  description: 'Review the items in your ShopStore cart before checking out.',
}

export default function CartPage() {
  return (
    <section className="section">
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Your Cart</h1>
        </header>

        <CartView />
      </div>
    </section>
  )
}
