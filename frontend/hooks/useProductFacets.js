'use client'

import { useEffect, useState } from 'react'

import { getCategories } from '@/services/categoryService'
import { getFacets } from '@/services/productService'

const PRICE_STEP = 100

const INITIAL_STATE = {
  categories: [],
  brands: [],
  badges: [],
  sizes: [],
  colors: [],
  priceRange: { min: 0, max: 0 },
  isLoading: true,
  error: null,
}

function roundToStep(value) {
  return Math.round(value / PRICE_STEP) * PRICE_STEP
}

/**
 * Derives the filter options through the service layer so the sidebar never
 * hardcodes facet lists, and never reaches into the data files itself.
 *
 * Sizes, colours and price bounds come from the products service. The category
 * list is intersected with the categories that actually appear on a product, so
 * the sidebar cannot offer a filter that returns nothing.
 */
export function useProductFacets() {
  const [state, setState] = useState(INITIAL_STATE)

  useEffect(() => {
    let cancelled = false

    Promise.all([getCategories(), getFacets()])
      .then(([categories, facets]) => {
        if (cancelled) {
          return
        }

        const stocked = new Set(facets.productCategories)

        setState({
          categories: categories.filter((category) => stocked.has(category.slug)),
          brands: facets.brands,
          badges: facets.badges,
          sizes: facets.sizes,
          colors: facets.colors,
          priceRange: {
            min: roundToStep(facets.priceRange.min),
            max: roundToStep(facets.priceRange.max),
          },
          isLoading: false,
          error: null,
        })
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            ...INITIAL_STATE,
            isLoading: false,
            error: error instanceof Error ? error : new Error('We could not load filters.'),
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
