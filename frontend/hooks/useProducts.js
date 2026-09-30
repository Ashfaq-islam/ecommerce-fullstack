'use client'

import { useEffect, useState } from 'react'

import { getAll, getFeatured } from '@/services/productService'

const INITIAL_STATE = { products: [], error: null, requestKey: null }

/**
 * Reads the product catalogue through the products service. The service owns
 * filtering, so this hook only owns the async lifecycle: it reports a real
 * `isLoading` while the request is in flight and surfaces failures to
 * `ProductGrid`'s error branch instead of hiding them.
 *
 * Filter keys match the query-param names so a parsed query string can be
 * spread straight in. Each accepts a single value or an array of values.
 *
 * `source: 'featured'` switches to the curated badged-and-in-stock selection
 * used by the home page, which ignores the filter fields.
 */
export function useProducts({
  limit,
  category,
  brand,
  badge,
  size,
  color,
  minPrice,
  maxPrice,
  source = 'all',
} = {}) {
  // Filters arrive as fresh arrays on every render, so key the request on a
  // serialised form rather than on identity to avoid refetching every render.
  const requestKey = JSON.stringify({
    source,
    limit: limit ?? null,
    category: category ?? null,
    brand: brand ?? null,
    badge: badge ?? null,
    size: size ?? null,
    color: color ?? null,
    minPrice: minPrice ?? null,
    maxPrice: maxPrice ?? null,
  })

  const [state, setState] = useState(INITIAL_STATE)

  useEffect(() => {
    let cancelled = false
    const { source: requestSource, limit: requestLimit, ...filters } =
      JSON.parse(requestKey)

    const request =
      requestSource === 'featured' ? getFeatured(requestLimit) : getAll({ ...filters, limit: requestLimit })

    request
      .then((products) => {
        if (!cancelled) {
          setState({ products, error: null, requestKey })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            products: [],
            error: error instanceof Error ? error : new Error('We could not load products.'),
            requestKey,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [requestKey])

  // Derived rather than stored, so a filter change immediately reports loading
  // and never renders the previous result set while the new one is in flight.
  const isCurrent = state.requestKey === requestKey

  return {
    products: isCurrent ? state.products : [],
    isLoading: !isCurrent,
    error: isCurrent ? state.error : null,
  }
}
