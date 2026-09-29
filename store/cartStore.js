'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const STORAGE_KEY = 'shopstore-cart-v1'
const MAX_QUANTITY = 99

function toQuantity(value, ceiling = MAX_QUANTITY) {
  const parsed = Math.floor(Number(value))

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1
  }

  return Math.min(parsed, ceiling)
}

function lineCeiling(item) {
  if (typeof item.stock !== 'number') {
    return MAX_QUANTITY
  }

  // A zero-stock line can still exist in storage from an older session, so keep
  // it removable by allowing a quantity of one instead of rejecting it outright.
  return Math.max(1, item.stock)
}

function isPurchasable(variant) {
  return typeof variant?.stock !== 'number' || variant.stock > 0
}

function buildLine(product, variant, quantity) {
  const stock = typeof variant?.stock === 'number' ? variant.stock : null

  return {
    productId: product.id,
    variantId: variant?.id ?? null,
    slug: product.slug,
    name: product.name,
    brand: product.brand ?? null,
    image: variant?.image ?? product.image,
    price: variant?.price ?? product.price,
    size: variant?.size ?? null,
    color: variant?.color ?? null,
    stock,
    quantity: toQuantity(quantity, stock != null ? Math.max(1, stock) : MAX_QUANTITY),
  }
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      addItem: (product, variant, quantity = 1) => {
        if (!product || !isPurchasable(variant)) {
          return
        }

        const line = buildLine(product, variant, quantity)

        set((state) => {
          const index = state.items.findIndex(
            (item) => item.productId === line.productId && item.variantId === line.variantId,
          )

          if (index === -1) {
            return { items: [...state.items, line] }
          }

          return {
            items: state.items.map((item, itemIndex) =>
              itemIndex === index
                ? {
                    ...item,
                    quantity: toQuantity(item.quantity + line.quantity, lineCeiling(item)),
                  }
                : item,
            ),
          }
        })
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId),
          ),
        }))
      },

      updateQuantity: (productId, variantId, quantity) => {
        set((state) => ({
          items: state.items.flatMap((item) => {
            if (item.productId !== productId || item.variantId !== variantId) {
              return [item]
            }

            const parsed = Math.floor(Number(quantity))

            if (!Number.isFinite(parsed) || parsed < 1) {
              return []
            }

            return [{ ...item, quantity: toQuantity(parsed, lineCeiling(item)) }]
          }),
        }))
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),

      getItemCount: () =>
        get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // The server has no localStorage, so rehydration is kicked off explicitly
      // from CartHydration. Without this the first client render would read a
      // persisted cart the server never saw, and React would report a
      // hydration mismatch on the header badge.
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated?.(true)
      },
    },
  ),
)
