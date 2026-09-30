'use client'

import { useEffect } from 'react'

import { useCartStore } from '@/store/cartStore'

export default function CartHydration() {
  useEffect(() => {
    if (!useCartStore.persist.hasHydrated()) {
      useCartStore.persist.rehydrate()
    }
  }, [])

  return null
}
