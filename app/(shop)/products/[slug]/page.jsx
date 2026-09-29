import { notFound } from 'next/navigation'

import ProductDetail from '@/components/product/ProductDetail'
import { ApiError } from '@/lib/apiClient'
import { getColorSwatches } from '@/lib/colors'
import { getBySlug } from '@/services/productService'

export async function generateMetadata({ params }) {
  const { slug } = await params

  // A failure here must not throw: metadata runs before the page body, so an
  // exception would turn a missing product into a 500 instead of a 404. Only a
  // 404 ApiError means the product is missing; everything else (5xx, network)
  // must bubble up so the route's error.jsx paints the real failure.
  const product = await getBySlug(slug).catch((error) => {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  })

  if (!product) {
    return { title: 'Product not found | ShopStore' }
  }

  return {
    title: `${product.name} | ShopStore`,
    description: product.description,
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params

  // Fetched together: both calls carry the artificial transport latency, so
  // awaiting them in parallel keeps the page at one round trip rather than two.
  const [product, swatches] = await Promise.all([getBySlug(slug), getColorSwatches()])

  if (!product) {
    notFound()
  }

  return (
    <section className="section">
      <div className="container">
        <ProductDetail product={product} swatches={swatches} />
      </div>
    </section>
  )
}
