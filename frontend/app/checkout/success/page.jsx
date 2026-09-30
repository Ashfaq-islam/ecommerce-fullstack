import OrderSuccess from '@/components/checkout/OrderSuccess'

export const metadata = {
  title: 'Order Confirmed | ShopStore',
  description: 'Your ShopStore order has been placed successfully.',
}

export default function CheckoutSuccessPage() {
  return (
    <section className="section">
      <div className="container">
        <OrderSuccess />
      </div>
    </section>
  )
}
