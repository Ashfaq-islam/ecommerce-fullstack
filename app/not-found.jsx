import EmptyState from '@/components/common/EmptyState'

export const metadata = {
  title: 'Product not found | ShopStore',
}

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <EmptyState
          title="Product not found"
          description="The product you are looking for may have been removed or the link may be incorrect."
          actionHref="/shop"
          actionLabel="Browse all products"
        />
      </div>
    </section>
  )
}
