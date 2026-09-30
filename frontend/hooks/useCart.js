'use client'

import { useCallback, useMemo } from 'react'

import { useCartStore } from '@/store/cartStore'

/**
 * Component-facing cart API.
 *
 * `total` and `itemCount` are derived from `items` rather than read through the
 * store's `getTotal`/`getItemCount`, because a component only re-renders when
 * the state it subscribed to changes. The store getters stay available for
 * non-render call sites such as event handlers.
 */
export function useCart() {
  const items = useCartStore((state) => state.items)
  const hasHydrated = useCartStore((state) => state.hasHydrated)
  const addItem = useCartStore((state) => state.addItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const itemCount = useMemo(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items],
  )

  const getTotal = useCallback(() => total, [total])
  const getItemCount = useCallback(() => itemCount, [itemCount])

  return {
    items,
    total,
    itemCount,
    isEmpty: items.length === 0,
    hasHydrated,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  }
}
